import os, base64
from algosdk import account, mnemonic
from algosdk.v2client import algod
from algosdk.transaction import *
from dotenv import load_dotenv

load_dotenv(".env")

client = algod.AlgodClient(
    os.getenv("ALGOD_TOKEN"),
    os.getenv("ALGOD_ADDRESS")
)

private_key = mnemonic.to_private_key(os.getenv("MNEMONIC"))
address = account.address_from_private_key(private_key)

with open("lending_approval.teal") as f:
    approval = f.read()

with open("lending_clear.teal") as f:
    clear = f.read()

approval_bin = base64.b64decode(client.compile(approval)["result"])
clear_bin = base64.b64decode(client.compile(clear)["result"])

params = client.suggested_params()

txn = ApplicationCreateTxn(
    sender=address,
    sp=params,
    on_complete=OnComplete.NoOpOC,
    approval_program=approval_bin,
    clear_program=clear_bin,
    # Global: POOL (int), RATE (int)
    global_schema=StateSchema(2, 0),
    # Local: DEBT (int), REPAY (int)
    local_schema=StateSchema(2, 0),
    app_args=[]
)

signed = txn.sign(private_key)
txid = client.send_transaction(signed)

print("DEPLOY TXID:", txid)
result = wait_for_confirmation(client, txid, 4)
print("LENDING APP ID:", result["application-index"])
