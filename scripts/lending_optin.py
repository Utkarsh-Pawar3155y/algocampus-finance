import os
from algosdk import account, mnemonic
from algosdk.v2client import algod
from algosdk.transaction import *
from dotenv import load_dotenv

load_dotenv(".env")

APP_ID = 755303790  # lending app id

client = algod.AlgodClient(
    os.getenv("ALGOD_TOKEN"),
    os.getenv("ALGOD_ADDRESS")
)

pk = mnemonic.to_private_key(os.getenv("MNEMONIC"))
sender = account.address_from_private_key(pk)

params = client.suggested_params()

txn = ApplicationOptInTxn(
    sender=sender,
    sp=params,
    index=APP_ID
)

signed = txn.sign(pk)
txid = client.send_transaction(signed)
wait_for_confirmation(client, txid, 4)

print("OPT-IN TXID:", txid)
print("✅ Lending opt-in successful")
