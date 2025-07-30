# x402 Payment Troubleshooting Guide

This guide helps diagnose and fix common issues with x402 payments on the Etherlink testnet.

## 🔍 Common Error: "execution reverted"

When you see this error during `eth_estimateGas` for `transferWithAuthorization`, it means the transaction would fail if executed. Here are the most common causes:

### 1. **Authorization Expired** ⏰
**Symptoms:**
- Error: "execution reverted"
- Current timestamp > `validBefore` timestamp

**Diagnosis:**
```bash
# Run the diagnostic script
npx tsx src/debug-transfer.ts
```

**Solution:**
- Create a new payment header with fresh timestamps
- Ensure `validBefore` is set to current time + timeout period
- Check that `validAfter` is set to current time - buffer (e.g., 10 minutes)

### 2. **Nonce Already Used** 🔐
**Symptoms:**
- Error: "execution reverted"
- `authorizationState(nonce)` returns `true`

**Solution:**
- Generate a new unique nonce for each payment
- Never reuse nonces

### 3. **Insufficient Balance** 💰
**Symptoms:**
- Error: "execution reverted"
- Sender balance < required amount

**Solution:**
- Ensure sender has sufficient USDC tokens
- Check token decimals (USDC has 6 decimals)

### 4. **Invalid Timestamps** ⏱️
**Symptoms:**
- Error: "execution reverted"
- Current time < `validAfter` (not yet valid)
- Current time > `validBefore` (expired)

**Solution:**
- Set `validAfter` to current time - buffer
- Set `validBefore` to current time + timeout

### 5. **Contract Paused** ⏸️
**Symptoms:**
- Error: "execution reverted"
- USDC contract `paused()` returns `true`

**Solution:**
- Wait for contract to be unpaused
- Contact contract administrator

### 6. **Address Blacklisted** 🚫
**Symptoms:**
- Error: "execution reverted"
- Sender or recipient is blacklisted

**Solution:**
- Use different addresses
- Contact contract administrator to unblacklist

## 🛠️ Diagnostic Tools

### 1. **Debug Transfer Script**
```bash
# Run comprehensive diagnosis
npx tsx src/debug-transfer.ts
```

This script checks:
- Current block timestamp
- USDC contract state (paused, name, symbol, decimals)
- Facilitator wallet balance and blacklist status
- Authorization timestamp validity
- Sender balance and blacklist status
- Recipient blacklist status
- Nonce usage status

### 2. **Test Fresh Payment**
```bash
# Test with fresh timestamps
npx tsx src/test-fresh-payment.ts
```

This script:
- Creates a new payment header with current timestamps
- Validates timestamp ranges
- Signs the payment header
- Tests verification and settlement

## 🔧 Fixes Applied

### 1. **Enhanced Error Handling**
The facilitator route now includes:
- Timestamp validation before processing
- Detailed error messages with context
- Proper HTTP status codes
- Try-catch blocks for better error handling

### 2. **Timestamp Validation Function**
```typescript
function validateAuthorizationTimestamps(paymentPayload: PaymentPayload) {
  const currentTime = Math.floor(Date.now() / 1000);
  const validAfter = BigInt(paymentPayload.payload.authorization.validAfter);
  const validBefore = BigInt(paymentPayload.payload.authorization.validBefore);
  
  // Check if authorization is valid
  if (currentTime < validAfter) {
    return { isValid: false, reason: "Authorization is not yet valid" };
  }
  
  if (currentTime > validBefore) {
    return { isValid: false, reason: "Authorization has expired" };
  }
  
  return { isValid: true };
}
```

## 📋 Best Practices

### 1. **Timestamp Management**
- Set `validAfter` to current time - 10 minutes (buffer for clock skew)
- Set `validBefore` to current time + `maxTimeoutSeconds`
- Use blockchain timestamp, not system time

### 2. **Nonce Generation**
- Generate unique 32-byte nonces
- Never reuse nonces
- Use cryptographically secure random generation

### 3. **Balance Checks**
- Always verify sender has sufficient balance
- Account for token decimals
- Include gas fees in calculations

### 4. **Error Handling**
- Implement proper error handling in client code
- Log detailed error information
- Provide user-friendly error messages

## 🚨 Emergency Procedures

### If Contract is Paused
1. Check contract status: `paused()`
2. Wait for unpause or contact administrator
3. Consider alternative payment methods

### If Address is Blacklisted
1. Check blacklist status: `isBlacklisted(address)`
2. Use different wallet addresses
3. Contact administrator for unblacklisting

### If Authorization Expired
1. Create new payment header with fresh timestamps
2. Ensure proper timezone handling
3. Use blockchain timestamp for consistency

## 📞 Support

If you continue to experience issues:

1. Run the diagnostic scripts
2. Check the logs for detailed error information
3. Verify all prerequisites are met
4. Contact the development team with error details

## 🔗 Useful Links

- [Etherlink Testnet Explorer](https://testnet.explorer.etherlink.com)
- [USDC Contract on Etherlink](https://testnet.explorer.etherlink.com/address/0xe3A01f57C76B6bdf926618C910E546F794ff6dd4)
- [x402 Protocol Documentation](https://github.com/coinbase/x402) 