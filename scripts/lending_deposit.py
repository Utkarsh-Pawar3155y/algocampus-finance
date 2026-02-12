import os
from algosdk import account, mnemonic, logic
from algosdk.v2client import algod
from algosdk.transaction import *
from dotenv import load_dotenv

load_dotenv(".env")

APP_ID = 755303790
AMOUNT = 20_000_000  # 1 Algo instead of 2

client = algod.AlgodClient(
    os.getenv("ALGOD_TOKEN"),
    os.getenv("ALGOD_ADDRESS")
)

pk = mnemonic.to_private_key(os.getenv("MNEMONIC"))
sender = account.address_from_private_key(pk)
params = client.suggested_params()

app_call = ApplicationNoOpTxn(
    sender=sender,
    sp=params,
    index=APP_ID,
    app_args=[b"deposit"]
)

pay = PaymentTxn(
    sender=sender,
    sp=params,
    receiver=logic.get_application_address(APP_ID),
    amt=AMOUNT
)

gid = calculate_group_id([app_call, pay])
app_call.group = gid
pay.group = gid

signed = [app_call.sign(pk), pay.sign(pk)]
txid = client.send_transactions(signed)
wait_for_confirmation(client, txid, 4)

print("DEPOSIT TXID:", txid)
print("✅ Deposit successful")
