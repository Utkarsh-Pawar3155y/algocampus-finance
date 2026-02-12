
export interface Campaign {
  id: number;
  founder: string;
  title: string;
  target: number;
  raised: number;
  deadline: number;
  claimed: boolean;
}

export interface Loan {
  borrower: string;
  amount: number;
  dueDate: number;
  status: 'active' | 'repaid' | 'overdue';
}

export interface UserPasses {
  bronze: boolean;
  silver: boolean;
  repaymentCount: number;
}
