from algosdk import account, mnemonic

private_key, address = account.generate_account()

print("ADDRESS:")
print(address)

print("\nMNEMONIC (25 words):")
print(mnemonic.from_private_key(private_key))
