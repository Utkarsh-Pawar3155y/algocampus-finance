import os
from algosdk import account, mnemonic
from algosdk.v2client import algod
from algosdk.transaction import *
from dotenv import load_dotenv

load_dotenv(".env")

APP_ID = 755299523  # crowdfunding app id

client = algod.AlgodClient(
    os.getenv("ALGOD_TOKEN"),
    os.getenv("ALGOD_ADDRESS")
)

private_key = mnemonic.to_private_key(os.getenv("MNEMONIC"))
sender = account.address_from_private_key(private_key)

params = client.suggested_params()

txn = ApplicationNoOpTxn(
    sender=sender,
    sp=params,
    index=APP_ID,
    app_args=[b"refund"]
)

signed = txn.sign(private_key)
txid = client.send_transaction(signed)

print("REFUND TXID:", txid)
wait_for_confirmation(client, txid, 4)
print("✅ Refund successful")
