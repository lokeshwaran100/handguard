//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IOracle.sol";
import "./HederaTokenService.sol";
import "./HederaResponseCodes.sol";

interface IWHBAR {
    function deposit() external payable;
    function deposit(address user, address spender) external payable;
    function withdraw(uint256) external;
}

// Uniswap V2 Router Interface
interface IUniswapV2Router02 {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    
    function swapExactETHForTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable returns (uint[] memory amounts);
    
    function swapExactTokensForETH(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    
    function getAmountsOut(uint amountIn, address[] calldata path)
        external view returns (uint[] memory amounts);
}

/**
 * Fund Contract - Manages individual index funds
 * @author Handguard Index
 */
contract Fund is ERC20, Ownable, HederaTokenService {
    error WhbarDepositFailed();
    // Fund metadata
    string public fundName;
    string public fundTicker;
    address[] public underlyingTokens;
    address public creator;
    address public oracle;
    address public dex;
    address public whbar;

    // Token proportions for rebalancing
    mapping(address => uint256) public targetProportions;
    
    // Fee structure (1% = 100 basis points)
    uint256 public constant FEE_BASIS_POINTS = 100; // 1%
    uint256 public constant BASIS_POINTS_DENOMINATOR = 10000;
    uint256 public constant SLIPPAGE_BUFFER_BASIS_POINTS = 200; // 2%
    
    // Uniswap V2 doesn't use fee tiers like V3
    
    // Fee distribution percentages
    uint256 public constant CREATOR_FEE_PERCENT = 50; // 50% to creator
    uint256 public constant HGI_BUYBACK_PERCENT = 25; // 25% to HGI buyback
    uint256 public constant TREASURY_PERCENT = 25;    // 25% to treasury
    
    // Treasury address
    address public treasury;
    
    // Events
    event FundTokenBought(address indexed buyer, uint256 hbarAmount, uint256 fundTokensMinted, uint256 feePaid);
    event FundTokenSold(address indexed seller, uint256 fundTokensBurned, uint256 hbarReturned, uint256 feePaid);
    event FeesDistributed(uint256 creatorFee, uint256 agiBuybackFee, uint256 treasuryFee);
    event Rebalanced(uint256 totalNavUsd);
    
    constructor(
        string memory _fundName,
        string memory _fundTicker,
        address[] memory _underlyingTokens,
        address _creator,
        address _oracle,
        address _treasury,
        address _dex,
        address _whbar
    ) ERC20(_fundName, _fundTicker) Ownable(_creator) {
        fundName = _fundName;
        fundTicker = _fundTicker;
        underlyingTokens = _underlyingTokens;
        creator = _creator;
        oracle = _oracle;
        treasury = _treasury;
        dex = _dex;
        whbar = _whbar;
        _transferOwnership(_creator);

        // Initialize with equal proportions
        require(_underlyingTokens.length > 0, "No underlying tokens");
        uint256 equalProportion = 100 / _underlyingTokens.length;
        for (uint i = 0; i < _underlyingTokens.length; i++) {
            targetProportions[_underlyingTokens[i]] = equalProportion;
        }
    }
    
    /**
     * @notice Allows the owner to set new target proportions for the underlying assets.
     * @dev The sum of all proportions must equal 100. This will trigger a rebalance.
     * @param _tokens An array of token addresses to update.
     * @param _proportions An array of corresponding target proportions (e.g., 50 for 50%).
     */
    function setProportions(address[] memory _tokens, uint256[] memory _proportions) external onlyOwner {
        require(_tokens.length == _proportions.length, "Array lengths mismatch");

        uint256 totalProportion = 0;
        for (uint i = 0; i < _proportions.length; i++) {
            totalProportion += _proportions[i];
        }
        require(totalProportion == 100, "Proportions must sum to 100");

        // Reset old proportions for tokens being updated
        for(uint i = 0; i < underlyingTokens.length; i++){
            for(uint j = 0; j < _tokens.length; j++){
                if(underlyingTokens[i] == _tokens[j]){
                    targetProportions[underlyingTokens[i]] = 0;
                }
            }
        }
        
        // Set new proportions
        for (uint i = 0; i < _tokens.length; i++) {
            require(targetProportions[_tokens[i]] == 0, "Token not in fund or duplicate");
            targetProportions[_tokens[i]] = _proportions[i];
        }
        
        rebalance();
    }

    /**
     * @notice Rebalances the fund's assets to match the target proportions.
     * @dev Sells overweight assets for WHBAR, then buys underweight assets with the WHBAR.
     */
    function rebalance() public onlyOwner {
        uint256 totalNavUsd = _getTotalNavUsd();
        
        _sellOverweightTokens(totalNavUsd);
        _buyUnderweightTokens(totalNavUsd);

        emit Rebalanced(totalNavUsd);
    }

    function _sellOverweightTokens(uint256 totalNavUsd) internal {
        for (uint i = 0; i < underlyingTokens.length; i++) {
            address token = underlyingTokens[i];
            uint256 balance = IERC20(token).balanceOf(address(this));
            if (balance == 0) continue;

            uint256 price = IOracle(oracle).getPrice(token);
            uint8 decimals = IERC20Metadata(token).decimals();
            uint256 currentValueUsd = (balance * price) / (10**decimals);
            uint256 targetValueUsd = (totalNavUsd * targetProportions[token]) / 100;

            if (currentValueUsd > targetValueUsd) {
                uint256 excessValueUsd = currentValueUsd - targetValueUsd;
                uint256 amountToSell = (excessValueUsd * (10**decimals)) / price;

                if (amountToSell > 0) {
                    IERC20(token).approve(dex, amountToSell);
                    
                    address[] memory path = new address[](2);
                    path[0] = token;
                    path[1] = whbar;
                    
                    IUniswapV2Router02(dex).swapExactTokensForTokens(
                        amountToSell,
                        1, // amountOutMin
                        path,
                        address(this),
                        block.timestamp + 1200
                    );
                }
            }
        }
    }

    function _buyUnderweightTokens(uint256 totalNavUsd) internal {
         for (uint i = 0; i < underlyingTokens.length; i++) {
            address token = underlyingTokens[i];
            uint256 balance = IERC20(token).balanceOf(address(this));
            
            uint256 price = IOracle(oracle).getPrice(token);
            uint8 decimals = IERC20Metadata(token).decimals();
            uint256 currentValueUsd = (balance * price) / (10**decimals);
            uint256 targetValueUsd = (totalNavUsd * targetProportions[token]) / 100;

            if (targetValueUsd > currentValueUsd) {
                uint256 deficitValueUsd = targetValueUsd - currentValueUsd;
                uint256 whbarPriceUsd = IOracle(oracle).getPrice(address(0));
                uint256 whbarToSpend = (deficitValueUsd * 1e18) / whbarPriceUsd;

                if (whbarToSpend > 0 && whbarToSpend <= IERC20(whbar).balanceOf(address(this))) {
                    IERC20(whbar).approve(dex, whbarToSpend);
                    
                    address[] memory path = new address[](2);
                    path[0] = whbar;
                    path[1] = token;
                    
                    IUniswapV2Router02(dex).swapExactTokensForTokens(
                        whbarToSpend,
                        1, // amountOutMin
                        path,
                        address(this),
                        block.timestamp + 1200
                    );
                }
            }
        }
    }
    
    /**
     * @dev Buy fund tokens with HBAR
     */
    function buy() external payable {
        require(msg.value > 0, "Must send HBAR");
        require(underlyingTokens.length > 0, "No underlying tokens");
        
        uint256 fee = (msg.value * FEE_BASIS_POINTS) / BASIS_POINTS_DENOMINATOR;
        uint256 remainingAmount = msg.value - fee;
        
        // Calculate how many fund tokens to mint based on current fund value
        uint256 fundTokensToMint = calculateFundTokensToMint(remainingAmount);
        
        // Mint fund tokens to buyer
        _mint(msg.sender, fundTokensToMint);
        
        // Distribute fees
        distributeFees(fee);
        
        // Buy underlying tokens with remaining HBAR
        // int256 response = HederaTokenService.associateToken(address(this), whbar);
        // require(
        //     response == HederaResponseCodes.SUCCESS ||
        //         response == HederaResponseCodes.OK ||
        //         response == HederaResponseCodes.TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT,
        //     "WHBAR association failed"
        // );

        IWHBAR(whbar).deposit{value: remainingAmount}();

        // if (remainingAmount > 0) {
        //     // Try the auto-approve variant first (required on some Hedera deployments)
        //     (bool success, ) = whbar.call{value: remainingAmount}(
        //         abi.encodeWithSignature("deposit(address,address)", address(this), address(this))
        //     );

        //     if (!success) {
        //         // Fall back to standard deposit() when auto-approve is unavailable
        //         (success, ) = whbar.call{value: remainingAmount}(abi.encodeWithSignature("deposit()"));
        //         if (!success) {
        //             revert WhbarDepositFailed();
        //         }
        //     }
        // }
        buyUnderlyingTokens(IERC20(whbar).balanceOf(address(this)));
        
        emit FundTokenBought(msg.sender, msg.value, fundTokensToMint, fee);
    }

function buyUnderlyingTokens(uint256 whbarAmount) internal {
    require(whbarAmount > 0, "Amount must be greater than 0");
    require(dex != address(0), "DEX not set");

    uint256 amountPerToken = whbarAmount / underlyingTokens.length;

    for (uint256 i = 0; i < underlyingTokens.length; i++) {
        address token = underlyingTokens[i];
        
        if (amountPerToken > 0) {
            int256 response = HederaTokenService.associateToken(address(this), token);
            //uint256 responseCode = IERC20(whbar).associate();

            IERC20(whbar).approve(dex, amountPerToken);
            
            address[] memory path = new address[](2);
            path[0] = whbar;
            path[1] = token;
            
            try IUniswapV2Router02(dex).swapExactTokensForTokens(
                amountPerToken,
                1, // amountOutMin
                path,
                address(this),
                block.timestamp + 1200
            ) returns (uint[] memory amounts) {
                // Swap successful, amounts[1] contains the tokens received
            } catch {
                // If swap fails, just continue to the next token
                continue;
            }
        }
    }
}
    
function sellUnderlyingTokens(uint256 sellPercentage) internal returns (uint256 totalWhbarReceived) {
    require(dex != address(0), "DEX not set");
    require(sellPercentage > 0, "Sell percentage must be greater than 0");

    totalWhbarReceived = 0;

    for (uint256 i = 0; i < underlyingTokens.length; i++) {
        address token = underlyingTokens[i];
        uint256 tokenBalance = IERC20(token).balanceOf(address(this));

        if (tokenBalance > 0) {
            uint256 tokensToSell = (tokenBalance * sellPercentage) / 1e18;
            if (tokensToSell == 0) continue;

            IERC20(token).approve(dex, tokensToSell);

            address[] memory path = new address[](2);
            path[0] = token;
            path[1] = whbar;

            try IUniswapV2Router02(dex).swapExactTokensForTokens(
                tokensToSell,
                1, // amountOutMin
                path,
                address(this),
                block.timestamp + 1200
            ) returns (uint[] memory amounts) {
                totalWhbarReceived += amounts[1]; // amounts[1] is the WHBAR received
            } catch {
                // If swap fails, continue
                continue;
            }
        }
    }

    return totalWhbarReceived;
}

    /**
     * @dev Sell fund tokens for HBAR
     * @param fundTokenAmount Amount of fund tokens to sell
     */
    function sell(uint256 fundTokenAmount) external {
        require(fundTokenAmount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= fundTokenAmount, "Insufficient fund tokens");
        require(totalSupply() > 0, "No fund tokens in circulation");
        
        // Calculate the percentage of fund tokens being sold
        uint256 sellPercentage = (fundTokenAmount * 1e18) / totalSupply(); // 18 decimals for precision
        
        // Sell underlying tokens proportionally and get total WHBAR received
        uint256 totalWhbarReceived = sellUnderlyingTokens(sellPercentage);
        require(totalWhbarReceived > 0, "No value to return");

        // unwrap WHBAR to HBAR
        IWHBAR(whbar).withdraw(totalWhbarReceived);
        
        // Calculate fee (1%)
        uint256 fee = (totalWhbarReceived * FEE_BASIS_POINTS) / BASIS_POINTS_DENOMINATOR;
        uint256 hbarToReturn = totalWhbarReceived - fee;
        
        // Burn fund tokens
        _burn(msg.sender, fundTokenAmount);
        
        // Distribute fees
        distributeFees(fee);
        
        // Transfer HBAR to seller
        (bool success, ) = payable(msg.sender).call{value: hbarToReturn}("");
        require(success, "Failed to transfer HBAR");
        
        emit FundTokenSold(msg.sender, fundTokenAmount, hbarToReturn, fee);
    }
    
    /**
     * @dev Get current fund value in HBAR
     * @return Total fund value in HBAR
     */
    function getCurrentFundValue() external view returns (uint256) {
        if (totalSupply() == 0) return 0;
        
        uint256 totalValue = 0;
        for (uint256 i = 0; i < underlyingTokens.length; i++) {
            address token = underlyingTokens[i];
            uint256 tokenBalance = IERC20(token).balanceOf(address(this));
            
            if (tokenBalance > 0) {
                // Convert token balance to HBAR value using oracle prices
                uint256 tokenPriceUSD = IOracle(oracle).getPrice(token);
                uint256 hbarPriceUSD = IOracle(oracle).getPrice(address(0));
                
                if (tokenPriceUSD > 0 && hbarPriceUSD > 0) {
                    // Calculate token value in USD
                    uint256 tokenValueUSD = (tokenBalance * tokenPriceUSD) / 1e8;
                    // Convert USD value to HBAR
                    uint256 tokenValueInHbar = (tokenValueUSD * 1e8) / hbarPriceUSD;
                    totalValue += tokenValueInHbar;
                } else {
                    // Fallback: use token balance as HBAR value
                    totalValue += tokenBalance;
                }
            }
        }
        return totalValue;
    }
    
    /**
     * @dev Get current fund value in USD
     * @return Total fund value in USD (18 decimals)
     */
    function getCurrentFundValueUSD() internal view returns (uint256) {
        return _getTotalNavUsd();
    }

    function _getTotalNavUsd() internal view returns (uint256) {
        if (totalSupply() == 0) return 0;
        
        uint256 totalValueUSD = 0;
        for (uint256 i = 0; i < underlyingTokens.length; i++) {
            address token = underlyingTokens[i];
            uint256 tokenBalance = IERC20(token).balanceOf(address(this));
            
            if (tokenBalance > 0) {
                uint256 tokenPriceUSD = IOracle(oracle).getPrice(token);
                uint8 decimals = IERC20Metadata(token).decimals();
                uint256 tokenValueUSD = (tokenBalance * tokenPriceUSD) / (10**decimals);
                totalValueUSD += tokenValueUSD;
            }
        }
        return totalValueUSD;
    }
    
    /**
     * @dev Get fund token balance for a specific address
     * @param user Address to check balance for
     * @return Fund token balance
     */
    function fundTokenBalanceOf(address user) external view returns (uint256) {
        return balanceOf(user);
    }
    
    /**
     * @dev Calculate how many fund tokens to mint for given HBAR amount
     * @param hbarAmount Amount of HBAR to invest
     * @return Fund tokens to mint
     */
    function calculateFundTokensToMint(uint256 hbarAmount) internal view returns (uint256) {
        if (totalSupply() == 0) {
            // First investment - mint tokens 1:1 with hbar amount
            return hbarAmount;
        }
        
        // Apply a buffer to the investment amount to account for potential slippage on asset purchase
        uint256 effectiveHbarAmount = (hbarAmount * (BASIS_POINTS_DENOMINATOR - SLIPPAGE_BUFFER_BASIS_POINTS))
            / BASIS_POINTS_DENOMINATOR;

        // Get HBAR price in USD (8 decimals)
        uint256 hbarPriceUSD = IOracle(oracle).getPrice(address(0));
        
        // Convert HBAR amount to USD value (18 decimals for HBAR, 8 decimals for price)
        // hbarAmount * hbarPriceUSD / 10^8 = USD value with 18 decimals
        uint256 hbarValueUSD = (effectiveHbarAmount * hbarPriceUSD) / 1e8;
        
        // Get current fund value in USD
        uint256 currentFundValueUSD = _getTotalNavUsd();
        
        // Calculate fund tokens to mint based on USD proportion
        // (hbarValueUSD * totalSupply) / currentFundValueUSD
        return (hbarValueUSD * totalSupply()) / currentFundValueUSD;
    }
    
    /**
     * @dev Calculate HBAR value for given fund token amount
     * @param fundTokenAmount Amount of fund tokens
     * @return HBAR value
     */
    function calculateHbarValue(uint256 fundTokenAmount) internal view returns (uint256) {
        if (totalSupply() == 0) return 0;
        
        uint256 currentFundValue = this.getCurrentFundValue();
        return (fundTokenAmount * currentFundValue) / totalSupply();
    }
    
    /**
     * @dev Distribute fees to creator, HGI buyback, and treasury
     * @param totalFee Total fee amount to distribute
     */
    function distributeFees(uint256 totalFee) internal {
        uint256 creatorFee = (totalFee * CREATOR_FEE_PERCENT) / 100;
        uint256 agiBuybackFee = (totalFee * HGI_BUYBACK_PERCENT) / 100;
        uint256 treasuryFee = (totalFee * TREASURY_PERCENT) / 100;
        
        // Send to creator
        if (creatorFee > 0) {
            (bool success1, ) = payable(creator).call{value: creatorFee}("");
            require(success1, "Failed to send creator fee");
        }
        
        // Send to treasury (HGI buyback will be handled by treasury)
        if (agiBuybackFee + treasuryFee > 0) {
            (bool success2, ) = payable(treasury).call{value: agiBuybackFee + treasuryFee}("");
            require(success2, "Failed to send treasury fee");
        }
        
        emit FeesDistributed(creatorFee, agiBuybackFee, treasuryFee);
    }
    
    /**
     * @dev Get underlying tokens array
     * @return Array of underlying token addresses
     */
    function getUnderlyingTokens() external view returns (address[] memory) {
        return underlyingTokens;
    }
    
    /**
     * @dev Update treasury address (only owner)
     * @param newTreasury New treasury address
     */
    function updateTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury address");
        treasury = newTreasury;
    }
    
    /**
     * @dev Update oracle address (only owner)
     * @param newOracle New oracle address
     */
    function updateOracle(address newOracle) external onlyOwner {
        require(newOracle != address(0), "Invalid oracle address");
        oracle = newOracle;
    }
    
    /**
     * @dev Update DEX address (only owner)
     * @param newDex New DEX address
     */
    function updateDex(address newDex) external onlyOwner {
        require(newDex != address(0), "Invalid DEX address");
        dex = newDex;
    }
    
    /**
     * @dev Get token balance for a specific token
     * @param token The token address
     * @return balance The token balance
     */
    function getTokenBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
    
    /**
     * @dev Allow contract to receive HBAR
     */
    receive() external payable {}
}
