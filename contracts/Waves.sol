// SPDX-License-Identifier: MIT

pragma solidity 0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "hardhat/console.sol";

contract Waves is ERC20Burnable {
    uint256 public constant INITIAL_SUPPLY = 2_000_000 * 10 ** 9;
    uint256 public constant MINT_REWARD = 10 ** 9;

    constructor() ERC20("Waves", "WAV") {
        _update(address(0), _msgSender(), INITIAL_SUPPLY);
    }

    function decimals() public view virtual override returns (uint8) {
        return 9;
    }

    function _mintMinerReward() internal {
        _mint(block.coinbase, MINT_REWARD);
    }

    function _update(address from, address to, uint256 value) internal virtual override {
        if (!(from == address(0) && to == block.coinbase)) {
            _mintMinerReward();
        }
        super._update(from, to, value);
    }
}
