// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Use console.log for Hardhat debugging
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RecurringPayments is ReentrancyGuard, Ownable {
    struct Payment {
        address payer;
        address provider;
        uint256 amount;
        address token;
        uint256 dueDate;
        bool isRecurring;
        uint256 interval;
        bool executed;
        bool active;
    }

    mapping(uint256 => Payment) public payments;
    uint256 public paymentCount;

    // Events for Notifications & Updates
    event PaymentScheduled(
        uint256 indexed paymentId,
        address indexed payer,
        address indexed provider,
        uint256 amount,
        address token,
        uint256 dueDate
    );
    event PaymentExecuted(
        uint256 indexed paymentId,
        address indexed provider,
        uint256 amount,
        address token
    );
    event PaymentFailed(uint256 indexed paymentId, string reason);
    event PaymentCancelled(uint256 indexed paymentId);
    event FundsDeposited(
        uint256 indexed paymentId,
        uint256 amount,
        address token
    );
    event Pong();

    constructor() Ownable(msg.sender) {}

    // Schedule a new payment
    function schedulePayment(
        address provider,
        uint256 amount,
        address token,
        uint256 dueDate,
        bool isRecurring,
        uint256 interval
    ) external payable nonReentrant {
        require(provider != address(0), "Invalid provider address");
        require(amount > 0, "Amount must be greater than 0");
        require(dueDate > block.timestamp, "Due date must be in the future");
        if (isRecurring) {
            require(interval >= 1 days, "Interval must be at least 1 day");
        }

        paymentCount++;

        payments[paymentCount] = Payment({
            payer: msg.sender,
            provider: provider,
            amount: amount,
            token: token,
            dueDate: dueDate,
            isRecurring: isRecurring,
            interval: interval,
            executed: false,
            active: true
        });

        // Handle funds deposit
        if (token == address(0)) {
            // Eth Payment
            require(msg.value >= amount, "Insufficient ETH sent");
        } else {
            IERC20(token).transferFrom(msg.sender, address(this), amount);
        }

        emit PaymentScheduled(
            paymentCount,
            msg.sender,
            provider,
            amount,
            token,
            dueDate
        );
    }

    // Execute a due payment (to be done by a cron job)
    function executePayment(uint256 paymentId) external nonReentrant {
        Payment storage payment = payments[paymentId];
        require(payment.active, "Payment is not active");
        require(!payment.executed, "Payment already executed");
        require(block.timestamp >= payment.dueDate, "Payment not due yet");

        // check balance
        if (payment.token == address(0)) {
            require(
                address(this).balance >= payment.amount,
                "Insufficient ETH balance"
            );
        } else {
            require(
                IERC20(payment.token).balanceOf(address(this)) >=
                    payment.amount,
                "Insufficient token balance"
            );
        }

        // Transfer funds to provider
        bool success;
        if (payment.token == address(0)) {
            (success, ) = payment.provider.call{value: payment.amount}("");
        } else {
            success = IERC20(payment.token).transfer(
                payment.provider,
                payment.amount
            );
        }

        if (!success) {
            emit PaymentFailed(paymentId, "Transfer failed");
            return;
        }

        // Update payment status
        payment.executed = true;
        emit PaymentExecuted(
            paymentId,
            payment.provider,
            payment.amount,
            payment.token
        );

        // Handle recurring payments;
        if (payment.isRecurring) {
            payment.dueDate += payment.interval;
            payment.executed = false; // reset for the next cycle
        } else {
            payment.active = false; // for one time payment
        }
    }

    // Cancel a payment and refund funds
    function cancelPayment(uint256 paymentId) external nonReentrant {
        Payment storage payment = payments[paymentId];
        require(
            msg.sender == payment.payer || msg.sender == owner(),
            "Not authorized"
        );
        require(payment.active, "Payment is not active");
        require(!payment.executed, "Payment already executed");

        payment.active = false;
        bool success;

        // Refund funds
        if (payment.token == address(0)) {
            (success, ) = payment.payer.call{value: payment.amount}("");
        } else {
            success = IERC20(payment.token).transfer(
                payment.payer,
                payment.amount
            );
        }

        require(success, "Refund failed");
        emit PaymentCancelled(paymentId);
    }

    // Deposit additional funds for a payment (e.g., for recurring payments)
    function depositFunds(uint256 paymentId) external payable nonReentrant {
        Payment storage payment = payments[paymentId];
        require(payment.active, "Payment is not active");
        require(msg.sender == payment.payer, "Not payer");

        uint256 amount;
        if (payment.token == address(0)) {
            amount = msg.value;
            require(amount > 0, "No ETH sent");
        } else {
            amount = IERC20(payment.token).allowance(msg.sender, address(this));
            require(amount > 0, "No tokens approved");
            IERC20(payment.token).transferFrom(
                msg.sender,
                address(this),
                amount
            );
        }

        emit FundsDeposited(paymentId, amount, payment.token);
    }

    function getDuePayments() external view returns (uint256[] memory) {
        uint256[] memory duePayments = new uint256[](paymentCount);
        uint256 count = 0;

        for (uint256 i = 0; i <= paymentCount; i++) {
            if (
                payments[i].dueDate <= block.timestamp &&
                !payments[i].executed &&
                payments[i].active
            ) {
                duePayments[count] = i;
                count++;
            }
        }

        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = duePayments[i];
        }

        return result;
    }

    // Emergency stop to pause contract
    bool public paused;
    modifier whenNoPaused(){
        require(!paused, "Contract is paused");
        _;
    }

    function pause() external onlyOwner {
        paused = true;
    }

    function unpause() external onlyOwner {
        paused = false;
    }

    function ping() public {
        console.log("Ping");
        emit Pong();
    }

    // Fallback to receive ETH
    receive() external payable {}
}
