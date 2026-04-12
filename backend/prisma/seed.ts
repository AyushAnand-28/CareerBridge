/**
 * CareerBridge — Database Seed Script
 *
 * Populates the DB with realistic dummy data for UI testing:
 *   3 Recruiters + 3 Companies
 *   6 Candidates with varied skills
 *   14 Job postings (mix of OPEN, DRAFT, CLOSED)
 *   14 Applications with match scores & AI analysis text
 *   8 Saved jobs
 *
 * Usage (from /backend directory):
 *   npx ts-node prisma/seed.ts
 *
 * Password for ALL seed accounts: seed1234
 */

import { PrismaClient, JobStatus, EmploymentType, ApplicationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  console.log('\n🌱 CareerBridge Seed Script\n' + '─'.repeat(40));

  const HASH = await bcrypt.hash('seed1234', 10);

  // ── Wipe existing data ────────────────────────────────────────────────────
  console.log('🗑  Clearing existing data…');
  await prisma.savedJob.deleteMany();
  await prisma.application.deleteMany();
  await prisma.jobPosting.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();
  console.log('   Done.\n');

  // ── Recruiters ────────────────────────────────────────────────────────────
  console.log('👔 Creating recruiters…');
  const alice = await prisma.user.create({
    data: {
      email: 'alice@nexaworks.io',
      name: 'Alice Chen',
      password: HASH,
      role: 'RECRUITER',
      bio: 'Engineering talent lead at NexaWorks. Passionate about connecting great engineers with impactful products.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
      location: 'San Francisco, CA',
    },
  });
  const bob = await prisma.user.create({
    data: {
      email: 'bob@stacklabs.dev',
      name: 'Bob Martinez',
      password: HASH,
      role: 'RECRUITER',
      bio: 'CTO & co-founder at StackLabs. We build developer tools that scale.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
      location: 'Austin, TX',
    },
  });
  const clara = await prisma.user.create({
    data: {
      email: 'clara@healthtech.com',
      name: 'Clara Davies',
      password: HASH,
      role: 'RECRUITER',
      bio: 'Head of Talent at HealthTech Solutions.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=clara',
      location: 'Boston, MA',
    },
  });
  console.log(`   ✅ ${alice.email}, ${bob.email}, ${clara.email}`);

  // ── Companies ─────────────────────────────────────────────────────────────
  console.log('🏢 Creating companies…');
  const nexaworks = await prisma.company.create({
    data: {
      name: 'NexaWorks',
      description: 'NexaWorks is a Series B SaaS company building next-gen workflow automation. We serve 500+ enterprise customers across 40 countries.',
      logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=nexaworks',
      website: 'https://nexaworks.io',
      location: 'San Francisco, CA',
      recruiterId: alice.id,
    },
  });
  const stacklabs = await prisma.company.create({
    data: {
      name: 'StackLabs',
      description: 'StackLabs builds developer productivity tools — CI/CD pipelines to AI-assisted code review. Backed by Y Combinator (W23).',
      logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=stacklabs',
      website: 'https://stacklabs.dev',
      location: 'Austin, TX (Remote-Friendly)',
      recruiterId: bob.id,
    },
  });
  const healthtech = await prisma.company.create({
    data: {
      name: 'HealthTech Solutions',
      description: 'Revolutionizing patient care through modern, secure technology.',
      logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=healthtech',
      website: 'https://healthtech-solutions.com',
      location: 'Boston, MA',
      recruiterId: clara.id,
    },
  });
  console.log(`   ✅ ${nexaworks.name}, ${stacklabs.name}, ${healthtech.name}`);

  // ── Candidates ────────────────────────────────────────────────────────────
  console.log('👩‍💻 Creating candidates…');
  const priya = await prisma.user.create({
    data: {
      email: 'priya.sharma@gmail.com',
      name: 'Priya Sharma',
      password: HASH,
      role: 'CANDIDATE',
      bio: '5 years building React / TypeScript products at scale. Ex-Flipkart. Open to remote roles.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
      location: 'Bangalore, India (Remote)',
      skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'PostgreSQL', 'Docker', 'AWS', 'Jest'],
      resumeUrl: 'https://example.com/priya-resume.pdf',
    },
  });
  const james = await prisma.user.create({
    data: {
      email: 'james.o@outlook.com',
      name: "James O'Brien",
      password: HASH,
      role: 'CANDIDATE',
      bio: 'Backend engineer focused on distributed systems, Kafka, and Go. 7 years at fintech startups.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james',
      location: 'Dublin, Ireland',
      skills: ['Go', 'Python', 'Kafka', 'Redis', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS'],
      resumeUrl: 'https://example.com/james-resume.pdf',
    },
  });
  const sara = await prisma.user.create({
    data: {
      email: 'sara.lee@proton.me',
      name: 'Sara Lee',
      password: HASH,
      role: 'CANDIDATE',
      bio: 'Full-stack dev specialising in Next.js & Supabase. Recent grad, building my first freelance client base.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sara',
      location: 'Seoul, South Korea',
      skills: ['React', 'Next.js', 'TypeScript', 'Tailwind', 'Supabase', 'JavaScript', 'Figma'],
      resumeUrl: 'https://example.com/sara-resume.pdf',
    },
  });
  const liam = await prisma.user.create({
    data: {
      email: 'liam.patel@gmail.com',
      name: 'Liam Patel',
      password: HASH,
      role: 'CANDIDATE',
      bio: 'DevOps/Platform engineer. Passionate about infrastructure-as-code, SRE practices, and automating everything.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=liam',
      location: 'London, UK',
      skills: ['Kubernetes', 'Terraform', 'AWS', 'GCP', 'Docker', 'Python', 'CI/CD', 'Helm', 'Prometheus'],
      resumeUrl: 'https://example.com/liam-resume.pdf',
    },
  });
  const mark = await prisma.user.create({
    data: {
      email: 'mark.ios@gmail.com',
      name: 'Mark Taylor',
      password: HASH,
      role: 'CANDIDATE',
      bio: 'iOS Developer creating clean, fluid native experiences using Swift and SwiftUI.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mark',
      location: 'Chicago, IL',
      skills: ['Swift', 'SwiftUI', 'Objective-C', 'CoreData', 'XCTest'],
      resumeUrl: 'https://example.com/mark-resume.pdf',
    },
  });
  const sophia = await prisma.user.create({
    data: {
      email: 'sophia.design@yahoo.com',
      name: 'Sophia Martinez',
      password: HASH,
      role: 'CANDIDATE',
      bio: 'Product Designer specialising in SaaS applications and complex UI flows.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sophia',
      location: 'Toronto, Canada',
      skills: ['Figma', 'UI/UX', 'Wireframing', 'Prototyping', 'CSS'],
      resumeUrl: 'https://example.com/sophia-resume.pdf',
    },
  });
  console.log(`   ✅ ${priya.name}, ${james.name}, ${sara.name}, ${liam.name}, ${mark.name}, ${sophia.name}`);

  // ── Job Postings ──────────────────────────────────────────────────────────
  console.log('📋 Creating job postings…');

  // NexaWorks jobs
  const snrFE = await prisma.jobPosting.create({ data: {
    title: 'Senior Frontend Engineer (React / TypeScript)',
    description: "Join our product team to build the next generation of our workflow automation UI. You'll own entire feature areas, from design collaboration through to production deployment. We expect strong TypeScript fundamentals, attention to performance, and experience working in a design-system-driven codebase.",
    techStack: ['React', 'TypeScript', 'GraphQL', 'Jest', 'CSS Modules'],
    employmentType: EmploymentType.FULL_TIME,
    location: 'Remote (US / EU)',
    salaryMin: 120_000, salaryMax: 160_000,
    status: JobStatus.OPEN,
    recruiterId: alice.id, companyId: nexaworks.id,
    createdAt: daysAgo(5),
  }});

  const fsNexa = await prisma.jobPosting.create({ data: {
    title: 'Full-Stack Engineer — Node.js & React',
    description: "We're looking for a versatile full-stack engineer to work across our API layer (Node.js / Express) and React frontend. Experience with PostgreSQL and REST API design is required.",
    techStack: ['Node.js', 'React', 'PostgreSQL', 'Docker', 'TypeScript'],
    employmentType: EmploymentType.FULL_TIME,
    location: 'San Francisco, CA',
    salaryMin: 110_000, salaryMax: 145_000,
    status: JobStatus.OPEN,
    recruiterId: alice.id, companyId: nexaworks.id,
    createdAt: daysAgo(10),
  }});

  const beadNexa = await prisma.jobPosting.create({ data: {
    title: 'Backend Engineering Lead',
    description: "As our Backend Lead you'll own the architecture and quality of our API platform. You'll mentor a team of 4 engineers, introduce best practices for testing and observability, and drive the migration from our monolith toward a service-oriented architecture.",
    techStack: ['Node.js', 'TypeScript', 'PostgreSQL', 'AWS', 'Redis', 'Kafka'],
    employmentType: EmploymentType.FULL_TIME,
    location: 'San Francisco, CA (Hybrid)',
    salaryMin: 155_000, salaryMax: 195_000,
    status: JobStatus.OPEN,
    recruiterId: alice.id, companyId: nexaworks.id,
    createdAt: daysAgo(2),
  }});

  const qaNexa = await prisma.jobPosting.create({ data: {
    title: 'QA / Automation Engineer (Contract)',
    description: "Short-term contract (3–6 months) to help build our Playwright E2E test suite and integrate it into our GitHub Actions CI pipeline.",
    techStack: ['Playwright', 'TypeScript', 'GitHub Actions', 'Jest'],
    employmentType: EmploymentType.CONTRACT,
    location: 'Remote',
    salaryMin: 80_000, salaryMax: 100_000,
    status: JobStatus.OPEN,
    recruiterId: alice.id, companyId: nexaworks.id,
    createdAt: daysAgo(14),
  }});

  const draftNexa = await prisma.jobPosting.create({ data: {
    title: 'Design Systems Engineer',
    description: "We are planning to grow our design systems team. This posting is exploratory — reach out if you're interested.",
    techStack: ['React', 'Figma', 'Storybook', 'CSS'],
    employmentType: EmploymentType.FULL_TIME,
    location: 'Remote',
    salaryMin: 100_000, salaryMax: 130_000,
    status: JobStatus.DRAFT,
    recruiterId: alice.id, companyId: nexaworks.id,
    createdAt: daysAgo(1),
  }});

  // StackLabs jobs
  const devops = await prisma.jobPosting.create({ data: {
    title: 'Platform / DevOps Engineer',
    description: "We need a Platform Engineer to own our Kubernetes infrastructure on AWS. You'll manage cluster upgrades, write Terraform modules, build developer-facing tooling, and support the on-call rotation.",
    techStack: ['Kubernetes', 'AWS', 'Terraform', 'Docker', 'Helm', 'Python'],
    employmentType: EmploymentType.FULL_TIME,
    location: 'Austin, TX (Remote-Friendly)',
    salaryMin: 115_000, salaryMax: 150_000,
    status: JobStatus.OPEN,
    recruiterId: bob.id, companyId: stacklabs.id,
    createdAt: daysAgo(7),
  }});

  const goRole = await prisma.jobPosting.create({ data: {
    title: 'Backend Engineer — Go / Distributed Systems',
    description: "Help us scale our CI/CD pipeline orchestration engine processing 2 million build jobs per day. You'll work with Go, gRPC, Kafka, and Redis in a highly concurrent, latency-sensitive environment.",
    techStack: ['Go', 'gRPC', 'Kafka', 'Redis', 'PostgreSQL', 'Kubernetes'],
    employmentType: EmploymentType.FULL_TIME,
    location: 'Remote (Worldwide)',
    salaryMin: 130_000, salaryMax: 175_000,
    status: JobStatus.OPEN,
    recruiterId: bob.id, companyId: stacklabs.id,
    createdAt: daysAgo(3),
  }});

  const aiRole = await prisma.jobPosting.create({ data: {
    title: 'AI / ML Engineer (Python)',
    description: "Build AI-assisted code review and test generation features into our developer tools platform. You'll fine-tune LLMs, build evaluation pipelines, and ship production inference APIs.",
    techStack: ['Python', 'PyTorch', 'FastAPI', 'LangChain', 'Docker', 'AWS'],
    employmentType: EmploymentType.FULL_TIME,
    location: 'Remote (US timezone preferred)',
    salaryMin: 140_000, salaryMax: 190_000,
    status: JobStatus.OPEN,
    recruiterId: bob.id, companyId: stacklabs.id,
    createdAt: daysAgo(6),
  }});

  const intern = await prisma.jobPosting.create({ data: {
    title: 'Frontend Intern — Next.js',
    description: "Join our frontend team for a 12-week paid internship. You'll ship real features under the mentorship of senior engineers.",
    techStack: ['React', 'Next.js', 'TypeScript', 'Tailwind'],
    employmentType: EmploymentType.INTERNSHIP,
    location: 'Austin, TX (On-site)',
    salaryMin: 25_000, salaryMax: 30_000,
    status: JobStatus.OPEN,
    recruiterId: bob.id, companyId: stacklabs.id,
    createdAt: daysAgo(20),
  }});

  const techWriter = await prisma.jobPosting.create({ data: {
    title: 'Technical Writer (Part-time)',
    description: "Write, maintain, and improve our developer documentation, API reference, and integration guides.",
    techStack: ['Markdown', 'Git', 'REST APIs', 'Docusaurus'],
    employmentType: EmploymentType.PART_TIME,
    location: 'Remote',
    salaryMin: 50_000, salaryMax: 65_000,
    status: JobStatus.CLOSED,
    recruiterId: bob.id, companyId: stacklabs.id,
    createdAt: daysAgo(45),
  }});

  // HealthTech jobs
  const iosHealth = await prisma.jobPosting.create({ data: {
    title: 'iOS Engineer — Patient App',
    description: 'Lead the development of our flagship patient-facing iOS app built entirely in SwiftUI. Focus on security, performance, and accessibility.',
    techStack: ['Swift', 'SwiftUI', 'XCTest', 'GraphQL'],
    employmentType: EmploymentType.FULL_TIME,
    location: 'Boston, MA (Hybrid)',
    salaryMin: 130_000, salaryMax: 165_000,
    status: JobStatus.OPEN,
    recruiterId: clara.id, companyId: healthtech.id,
    createdAt: daysAgo(4),
  }});

  const designerHealth = await prisma.jobPosting.create({ data: {
    title: 'Senior Product Designer',
    description: 'Design intuitive and accessible interfaces for healthcare professionals. Strong prototyping skills required.',
    techStack: ['Figma', 'Prototyping', 'UI/UX', 'Accessibility'],
    employmentType: EmploymentType.FULL_TIME,
    location: 'New York, NY',
    salaryMin: 110_000, salaryMax: 140_000,
    status: JobStatus.OPEN,
    recruiterId: clara.id, companyId: healthtech.id,
    createdAt: daysAgo(12),
  }});

  const dataHealth = await prisma.jobPosting.create({ data: {
    title: 'Data Scientist — Predictive Analytics',
    description: 'Work with vast amounts of health data to improve our predictive models.',
    techStack: ['Python', 'SQL', 'PyTorch', 'AWS', 'Pandas'],
    employmentType: EmploymentType.FULL_TIME,
    location: 'Remote (US)',
    salaryMin: 120_000, salaryMax: 155_000,
    status: JobStatus.OPEN,
    recruiterId: clara.id, companyId: healthtech.id,
    createdAt: daysAgo(8),
  }});

  const supportHealth = await prisma.jobPosting.create({ data: {
    title: 'Technical Support Specialist',
    description: 'Provide level 2 technical support for our clinic-facing software.',
    techStack: ['SQL', 'Jira', 'Zendesk'],
    employmentType: EmploymentType.FULL_TIME,
    location: 'Remote',
    salaryMin: 65_000, salaryMax: 85_000,
    status: JobStatus.CLOSED,
    recruiterId: clara.id, companyId: healthtech.id,
    createdAt: daysAgo(30),
  }});

  console.log('   ✅ 14 jobs created (11 OPEN, 1 DRAFT, 1 CONTRACT, 2 CLOSED)');

  // ── Applications ──────────────────────────────────────────────────────────
  console.log('📨 Creating applications…');

  // Priya → 3 jobs
  await prisma.application.create({ data: {
    candidateId: priya.id, jobId: snrFE.id,
    resumeUrl: priya.resumeUrl!,
    coverLetter: 'I have 5 years of production React/TypeScript experience at Flipkart, where I led a team building high-traffic e-commerce UIs. Very excited about the NexaWorks product.',
    matchScore: 87,
    aiAnalysis: "Strong match — candidate's React, TypeScript, GraphQL, and Jest skills align with 4 of 5 required technologies. Five years at scale is a significant plus. CSS Modules likely transferable from existing CSS experience.",
    status: ApplicationStatus.INTERVIEW,
    createdAt: daysAgo(4),
  }});

  await prisma.application.create({ data: {
    candidateId: priya.id, jobId: fsNexa.id,
    resumeUrl: priya.resumeUrl!,
    coverLetter: 'I love building across the full stack and have shipped multiple Node.js + React applications.',
    matchScore: 80,
    aiAnalysis: "Good match — candidate has strong proficiency in Node.js, React, TypeScript, and Docker. PostgreSQL present in profile. Cover letter shows genuine product interest. Recommend progressing to technical screen.",
    status: ApplicationStatus.REVIEWING,
    createdAt: daysAgo(9),
  }});

  await prisma.application.create({ data: {
    candidateId: priya.id, jobId: devops.id,
    resumeUrl: priya.resumeUrl!,
    coverLetter: 'Interested in expanding into infrastructure; comfortable with Docker and AWS.',
    matchScore: 25,
    aiAnalysis: "Weak match — primary expertise is frontend/fullstack. Lists Docker and AWS but lacks core Kubernetes, Terraform, and Helm skills central to this Platform Engineer role. Not recommended.",
    status: ApplicationStatus.REJECTED,
    createdAt: daysAgo(8),
  }});

  // James → 3 jobs
  await prisma.application.create({ data: {
    candidateId: james.id, jobId: goRole.id,
    resumeUrl: james.resumeUrl!,
    coverLetter: "Distributed systems and high-throughput pipelines are exactly my domain. I've built Kafka-based event pipelines handling 5M events/day and have been writing Go for 4 years.",
    matchScore: 92,
    aiAnalysis: "Excellent match — direct hands-on experience with Go, Kafka, Redis, and PostgreSQL in high-scale production environments. Seven years in fintech demonstrates strong reliability and complexity tolerance. Highly recommended for technical panel.",
    status: ApplicationStatus.ACCEPTED,
    createdAt: daysAgo(2),
  }});

  await prisma.application.create({ data: {
    candidateId: james.id, jobId: beadNexa.id,
    resumeUrl: james.resumeUrl!,
    coverLetter: 'While I primarily work in Go, I have Node.js experience and am comfortable with the AWS/Postgres/Redis stack. Ready to step into a lead role.',
    matchScore: 62,
    aiAnalysis: "Moderate match — backend fundamentals are strong. Has AWS, Redis, and PostgreSQL experience. Primary language (Go) differs from required TypeScript/Node.js. No explicit leadership experience evidenced in application.",
    status: ApplicationStatus.APPLIED,
    createdAt: daysAgo(1),
  }});

  await prisma.application.create({ data: {
    candidateId: james.id, jobId: devops.id,
    resumeUrl: james.resumeUrl!,
    coverLetter: 'I have strong Kubernetes and Docker experience from running self-hosted infrastructure and am comfortable with AWS.',
    matchScore: 58,
    aiAnalysis: "Partial match — lists Kubernetes, Docker, AWS, and Python covering 4 of 6 required skills. Terraform and Helm are absent. Python scripting is a plus for automation. Worth progressing if platform engineers are scarce.",
    status: ApplicationStatus.REVIEWING,
    createdAt: daysAgo(6),
  }});

  // Sara → 2 jobs
  await prisma.application.create({ data: {
    candidateId: sara.id, jobId: intern.id,
    resumeUrl: sara.resumeUrl!,
    coverLetter: "I'm a recent graduate with a live Next.js + Supabase portfolio project and active GitHub contributions. I'd love to grow as an engineer inside a strong team like StackLabs.",
    matchScore: 95,
    aiAnalysis: "Near-perfect match — direct Next.js, React, and TypeScript experience with a shipped project demonstrating initiative. Tailwind is a bonus skill. Ideal internship candidate; highly recommend for interview.",
    status: ApplicationStatus.INTERVIEW,
    createdAt: daysAgo(18),
  }});

  await prisma.application.create({ data: {
    candidateId: sara.id, jobId: snrFE.id,
    resumeUrl: sara.resumeUrl!,
    coverLetter: "Excited about design-system-driven development, though I acknowledge the senior experience requirement.",
    matchScore: 48,
    aiAnalysis: "Below threshold for senior role — has relevant React and TypeScript skills but lacks GraphQL, Jest, and the depth of production experience expected at this level. Strong candidate in 1–2 years.",
    status: ApplicationStatus.REJECTED,
    createdAt: daysAgo(4),
  }});

  // Liam → 2 jobs
  await prisma.application.create({ data: {
    candidateId: liam.id, jobId: devops.id,
    resumeUrl: liam.resumeUrl!,
    coverLetter: 'Infrastructure-as-code and Kubernetes cluster management are my daily work. I have provisioned multi-region EKS clusters with Terraform and Helm charts across three companies.',
    matchScore: 97,
    aiAnalysis: "Outstanding match — Kubernetes, AWS, Terraform, Docker, Helm, and Python cover all 6 required technologies with demonstrated production depth. SRE mindset and multi-region cluster experience are exactly what this role demands. Strongly recommend fast-tracking to offer.",
    status: ApplicationStatus.INTERVIEW,
    createdAt: daysAgo(5),
  }});

  await prisma.application.create({ data: {
    candidateId: liam.id, jobId: beadNexa.id,
    resumeUrl: liam.resumeUrl!,
    coverLetter: 'While my core expertise is infrastructure, I have scripted extensively in Python and worked closely with backend teams on reliability.',
    matchScore: 22,
    aiAnalysis: "Poor fit — role requires TypeScript/Node.js API leadership. Infrastructure expertise is impressive but misaligned with requirements. Not recommended unless scope shifts toward platform engineering.",
    status: ApplicationStatus.REJECTED,
    createdAt: daysAgo(11),
  }});

  // Mark -> HealthTech iOS
  await prisma.application.create({ data: {
    candidateId: mark.id, jobId: iosHealth.id,
    resumeUrl: mark.resumeUrl!,
    coverLetter: 'I have significant experience building medical applications using SwiftUI and HealthKit.',
    matchScore: 89,
    aiAnalysis: 'Excellent match — candidate exhibits core SwiftUI and Swift expertise and has prior healthcare sector context.',
    status: ApplicationStatus.INTERVIEW,
    createdAt: daysAgo(2),
  }});

  // Sophia -> HealthTech Designer
  await prisma.application.create({ data: {
    candidateId: sophia.id, jobId: designerHealth.id,
    resumeUrl: sophia.resumeUrl!,
    coverLetter: 'My portfolio includes complex dashboard redesigns prioritizing accessibility, matching this role perfectly.',
    matchScore: 94,
    aiAnalysis: 'Outstanding match — candidate proves high proficiency in Figma, prototyping, and accessibility principles directly aligned with healthcare product needs.',
    status: ApplicationStatus.REVIEWING,
    createdAt: daysAgo(5),
  }});

  // Sara -> HealthTech Designer (she's a dev, just checking what happens)
  await prisma.application.create({ data: {
    candidateId: sara.id, jobId: designerHealth.id,
    resumeUrl: sara.resumeUrl!,
    coverLetter: 'I have a strong eye for design alongside my frontend Next.js skills.',
    matchScore: 41,
    aiAnalysis: 'Poor match — candidate is a frontend engineer, not a dedicated product designer. While Figma is listed, they lack pure UI/UX depth required for a senior design position.',
    status: ApplicationStatus.REJECTED,
    createdAt: daysAgo(6),
  }});

  // Sophia -> NexaWorks Design Systems Engineer
  await prisma.application.create({ data: {
    candidateId: sophia.id, jobId: draftNexa.id,
    resumeUrl: sophia.resumeUrl!,
    coverLetter: 'I specialize in UI/UX and Figma, making me a great fit to orchestrate your design systems from the ground up.',
    matchScore: 78,
    aiAnalysis: 'Solid match on the design end. Figma and CSS skills are present, but lacks React or full Storybook engineering capability. A strong design partner if paired with an engineer.',
    status: ApplicationStatus.APPLIED,
    createdAt: daysAgo(1),
  }});

  console.log('   ✅ 14 applications created');

  // ── Saved Jobs ────────────────────────────────────────────────────────────
  console.log('🔖 Creating saved jobs…');
  await Promise.all([
    prisma.savedJob.create({ data: { candidateId: priya.id, jobId: beadNexa.id } }),
    prisma.savedJob.create({ data: { candidateId: priya.id, jobId: goRole.id } }),
    prisma.savedJob.create({ data: { candidateId: sara.id,  jobId: fsNexa.id } }),
    prisma.savedJob.create({ data: { candidateId: sara.id,  jobId: aiRole.id } }),
    prisma.savedJob.create({ data: { candidateId: liam.id,  jobId: goRole.id } }),
    prisma.savedJob.create({ data: { candidateId: james.id, jobId: aiRole.id } }),
    prisma.savedJob.create({ data: { candidateId: mark.id, jobId: snrFE.id } }),
    prisma.savedJob.create({ data: { candidateId: sophia.id, jobId: iosHealth.id } }),
  ]);
  console.log('   ✅ 8 saved jobs');

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(40));
  console.log('✅  Seed complete! All accounts → password: seed1234\n');
  console.log('Recruiters:');
  console.log('  alice@nexaworks.io   → NexaWorks dashboard');
  console.log('  bob@stacklabs.dev    → StackLabs dashboard');
  console.log('  clara@healthtech.com → HealthTech Solutions dashboard\n');
  console.log('Candidates:');
  console.log('  priya.sharma@gmail.com  (React/TS  — Interview, Reviewing, Rejected)');
  console.log('  james.o@outlook.com     (Go/BE     — Accepted, Applied, Reviewing)');
  console.log('  sara.lee@proton.me      (Next.js   — Interview, Rejected)');
  console.log('  liam.patel@gmail.com    (DevOps    — Interview, Rejected)');
  console.log('  mark.ios@gmail.com      (iOS/Swift — Interview)');
  console.log('  sophia.design@yahoo.com (Design    — Reviewing, Applied)');
  console.log('\nJobs: 14 total | Applications: 14 | Saved Jobs: 8\n');
}

main()
  .catch(e => { console.error('\n❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
