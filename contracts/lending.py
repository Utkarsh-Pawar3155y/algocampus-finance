from pyteal import *

def approval_program():
    # ---------- Global State ----------
    pool = Bytes("POOL")        # uint64 total liquidity
    rate = Bytes("RATE")        # uint64 interest percent (5)

    # ---------- Local State ----------
    debt = Bytes("DEBT")        # uint64 current debt
    repays = Bytes("REPAY")     # uint64 repayment count

    # ---------- On Create ----------
    on_create = Seq(
        App.globalPut(pool, Int(0)),
        App.globalPut(rate, Int(5)),
        Approve()
    )

    # ---------- Opt In ----------
    on_opt_in = Seq(
        App.localPut(Txn.sender(), debt, Int(0)),
        App.localPut(Txn.sender(), repays, Int(0)),
        Approve()
    )

    # ---------- Deposit ----------
    on_deposit = Seq(
        Assert(Global.group_size() == Int(2)),
        Assert(Gtxn[1].type_enum() == TxnType.Payment),
        Assert(Gtxn[1].receiver() == Global.current_application_address()),

        App.globalPut(
            pool,
            App.globalGet(pool) + Gtxn[1].amount()
        ),
        Approve()
    )

    # ---------- Borrow ----------
    amount = Btoi(Txn.application_args[1])

    on_borrow = Seq(
        Assert(App.localGet(Txn.sender(), debt) == Int(0)),
        Assert(App.globalGet(pool) >= amount),

        App.localPut(
            Txn.sender(),
            debt,
            amount + (amount * App.globalGet(rate) / Int(100))
        ),

        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.receiver: Txn.sender(),
            TxnField.amount: amount
        }),
        InnerTxnBuilder.Submit(),

        App.globalPut(pool, App.globalGet(pool) - amount),
        Approve()
    )

    # ---------- Repay ----------
    on_repay = Seq(
        Assert(Global.group_size() == Int(2)),
        Assert(Gtxn[1].type_enum() == TxnType.Payment),
        Assert(Gtxn[1].receiver() == Global.current_application_address()),
        Assert(Gtxn[1].amount() >= App.localGet(Txn.sender(), debt)),

        App.globalPut(
            pool,
            App.globalGet(pool) + Gtxn[1].amount()
        ),

        App.localPut(Txn.sender(), debt, Int(0)),
        App.localPut(
            Txn.sender(),
            repays,
            App.localGet(Txn.sender(), repays) + Int(1)
        ),
        Approve()
    )

    program = Cond(
        [Txn.application_id() == Int(0), on_create],
        [Txn.on_completion() == OnComplete.OptIn, on_opt_in],
        [Txn.application_args[0] == Bytes("deposit"), on_deposit],
        [Txn.application_args[0] == Bytes("borrow"), on_borrow],
        [Txn.application_args[0] == Bytes("repay"), on_repay],
    )

    return program


def clear_state_program():
    return Approve()


if __name__ == "__main__":
    print(compileTeal(approval_program(), Mode.Application, version=6))
    print(compileTeal(clear_state_program(), Mode.Application, version=6))
