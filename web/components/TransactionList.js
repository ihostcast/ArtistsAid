import React from 'react';
import { format } from 'date-fns';

const TransactionList = ({ transactions }) => {
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'donation':
        return (
          <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      case 'withdrawal':
        return (
          <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'fee':
        return (
          <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        );
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'donation':
        return 'text-green-600';
      case 'withdrawal':
        return 'text-red-600';
      case 'fee':
        return 'text-gray-600';
      default:
        return 'text-gray-900';
    }
  };

  const formatAmount = (amount, type) => {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));

    return type === 'withdrawal' || type === 'fee' ? `-${formattedAmount}` : formattedAmount;
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
        <p className="mt-1 text-sm text-gray-500">No transactions have been made yet.</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {transactions.map((transaction, idx) => (
          <li key={transaction.id}>
            <div className="relative pb-8">
              {idx !== transactions.length - 1 ? (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-white">
                    {getTransactionIcon(transaction.type)}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-500">
                      {transaction.description}
                      {transaction.cause && (
                        <span className="font-medium text-gray-900">
                          {' '}
                          for <a href={`/causes/${transaction.cause.id}`} className="text-indigo-600 hover:text-indigo-900">{transaction.cause.title}</a>
                        </span>
                      )}
                    </p>
                    {transaction.donor && (
                      <p className="text-sm text-gray-500">
                        from {transaction.donor.name}
                      </p>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-right text-sm">
                    <span className={getTransactionColor(transaction.type)}>
                      {formatAmount(transaction.amount, transaction.type)}
                    </span>
                    <p className="text-gray-500">
                      {format(new Date(transaction.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionList;
