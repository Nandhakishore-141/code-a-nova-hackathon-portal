import {
  Blocks,
  BrainCircuit,
  Cloud,
  Cpu,
  Globe,
  Landmark,
  ShieldCheck,
} from 'lucide-react';

export const DOMAIN_META = {
  'AI/ML': {
    icon: BrainCircuit,
    summary: 'Applied intelligence, vision, NLP, and agentic systems.',
  },
  'Web Dev': {
    icon: Globe,
    summary: 'Full-stack web apps, developer tools, and accessible platforms.',
  },
  IoT: {
    icon: Cpu,
    summary: 'Connected edge hardware, telemetry, and smart automation.',
  },
  'Cyber Security': {
    icon: ShieldCheck,
    summary: 'Threat detection, zero-trust tooling, and privacy engineering.',
  },
  Blockchain: {
    icon: Blocks,
    summary: 'Verifiable ledgers, smart contracts, and decentralized workflows.',
  },
  'Cloud & DevOps': {
    icon: Cloud,
    summary: 'Resilient infrastructure, CI/CD automation, and observability.',
  },
  FinTech: {
    icon: Landmark,
    summary: 'Digital payments, compliance tooling, and financial inclusion.',
  },
};

