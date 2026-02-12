import os
from algosdk import account, mnemonic
from algosdk.v2client import algod
from algosdk.transaction import *
from dotenv import load_dotenv

load_dotenv(".env")

APP_ID = 755303790
BORROW_AMOUNT = 1_000_000  # 1 Algo

client = algod.AlgodClient(
    os.getenv("ALGOD_TOKEN"),
    os.getenv("ALGOD_ADDRESS")
)

pk = mnemonic.to_private_key(os.getenv("MNEMONIC"))
sender = account.address_from_private_key(pk)
params = client.suggested_params()

txn = ApplicationNoOpTxn(
    sender=sender,
    sp=params,
    index=APP_ID,
    app_args=[b"borrow", BORROW_AMOUNT.to_bytes(8, "big")]
)

signed = txn.sign(pk)
txid = client.send_transaction(signed)
wait_for_confirmation(client, txid, 4)

print("BORROW TXID:", txid)
print("✅ Borrow successful")
