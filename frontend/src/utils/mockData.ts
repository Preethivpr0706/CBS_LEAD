import { Client, FollowUp, Loan } from '../types';

// Generate random IDs
const generateId = () => crypto.randomUUID();

// Generate random dates
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

// Generate random follow-ups
const generateFollowUps = (clientId: string, count: number = 3): FollowUp[] => {
  return Array.from({ length: count }, (_, i) => {
    const date = randomDate(new Date(2023, 0, 1), new Date());
    const followUpTypes = ['Call', 'Email', 'Meeting', 'Other'] as const;
    
    return {
      id: generateId(),
      clientId,
      type: followUpTypes[Math.floor(Math.random() * followUpTypes.length)],
      date,
      notes: `Follow-up with client to discuss loan options. ${i + 1}`,
      nextFollowUpDate: Math.random() > 0.5 ? randomDate(new Date(), new Date(2025, 0, 1)) : undefined,
      createdAt: date,
    };
  });
};

// Generate random loans
const generateLoans = (clientId: string, status: string): Loan[] => {
  // Only generate loans for 'Disbursed' or 'Completed' clients
  if (status !== 'Disbursed' && status !== 'Completed') {
    return [];
  }
  
  const loanCount = 1 + Math.floor(Math.random() * 2); // 1 or 2 loans
  
  return Array.from({ length: loanCount }, () => {
    const date = randomDate(new Date(2023, 0, 1), new Date());
    const amount = Math.floor(Math.random() * 9000000) + 1000000; // 1M to 10M
    
    return {
      id: generateId(),
      clientId,
      amount: amount.toString(),
      disbursementDate: date,
      proof: Math.random() > 0.3 ? 'disbursement-proof.pdf' : null,
      createdAt: date,
    };
  });
};

export const generateMockClients = (): Client[] => {
  const statuses = ['New', 'In Progress', 'Disbursed', 'Rejected', 'Completed'];
  
  const clients: Client[] = [
    {
      id: generateId(),
      name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      phone: '+91 98765 43210',
      address: '123 MG Road, Bengaluru',
      location: 'Bengaluru',
      monthlyTurnover: '500000',
      reference: 'Website',
      businessDetails: 'IT Services Company with 50 employees',
      status: 'In Progress',
      createdAt: randomDate(new Date(2023, 0, 1), new Date()),
      nextFollowUp: randomDate(new Date(), new Date(2023, 11, 31)),
    },
    {
      id: generateId(),
      name: 'Priya Patel',
      email: 'priya.patel@example.com',
      phone: '+91 87654 32109',
      address: '456 SV Road, Mumbai',
      location: 'Mumbai',
      monthlyTurnover: '1200000',
      reference: 'Existing Client',
      businessDetails: 'Manufacturing Unit',
      status: 'Disbursed',
      createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    },
    {
      id: generateId(),
      name: 'Amit Kumar',
      email: 'amit.kumar@example.com',
      phone: '+91 76543 21098',
      address: '789 Park Street, Kolkata',
      location: 'Kolkata',
      monthlyTurnover: '800000',
      reference: 'Bank Referral',
      businessDetails: 'Retail Chain with 5 outlets',
      status: 'Completed',
      createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    },
    {
      id: generateId(),
      name: 'Sneha Reddy',
      email: 'sneha.reddy@example.com',
      phone: '+91 65432 10987',
      address: '101 Anna Salai, Chennai',
      location: 'Chennai',
      monthlyTurnover: '350000',
      reference: 'Social Media',
      businessDetails: 'E-commerce Startup',
      status: 'New',
      createdAt: randomDate(new Date(2023, 0, 1), new Date()),
      nextFollowUp: randomDate(new Date(), new Date(2023, 11, 31)),
    },
    {
      id: generateId(),
      name: 'Vikram Singh',
      email: 'vikram.singh@example.com',
      phone: '+91 54321 09876',
      address: '202 Connaught Place, New Delhi',
      location: 'New Delhi',
      monthlyTurnover: '950000',
      reference: 'Trade Show',
      businessDetails: 'FMCG Distribution',
      status: 'Rejected',
      createdAt: randomDate(new Date(2023, 0, 1), new Date()),
    },
  ];
  
  // Add 5 more random clients
  for (let i = 0; i < 5; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)] as any;
    const id = generateId();
    
    clients.push({
      id,
      name: `Client ${i + 6}`,
      email: `client${i + 6}@example.com`,
      phone: `+91 ${Math.floor(Math.random() * 90000) + 10000} ${Math.floor(Math.random() * 90000) + 10000}`,
      address: `Address ${i + 6}`,
      location: ['Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Hyderabad', 'Pune'][Math.floor(Math.random() * 6)],
      monthlyTurnover: (Math.floor(Math.random() * 9000000) + 1000000).toString(),
      reference: ['Website', 'Referral', 'Advertisement', 'Cold Call', 'Social Media'][Math.floor(Math.random() * 5)],
      businessDetails: ['Retail', 'Manufacturing', 'Services', 'IT', 'Healthcare'][Math.floor(Math.random() * 5)],
      status,
      createdAt: randomDate(new Date(2023, 0, 1), new Date()),
      nextFollowUp: Math.random() > 0.5 ? randomDate(new Date(), new Date(2023, 11, 31)) : undefined,
    });
  }
  
  // Add follow-ups and loans
  return clients.map(client => {
    const followUpCount = Math.floor(Math.random() * 5); // 0 to 4 follow-ups
    const followUps = followUpCount > 0 ? generateFollowUps(client.id, followUpCount) : [];
    const loans = generateLoans(client.id, client.status);
    
    return {
      ...client,
      followUps,
      loans,
    };
  });
};