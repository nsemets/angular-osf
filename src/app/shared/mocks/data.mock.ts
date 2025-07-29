import { User } from '@osf/core/models';
import { Meeting } from '@osf/features/meetings/models/meetings.models';

export const MOCK_USER: User = {
  id: '1',
  fullName: 'John Doe',
  email: 'john@example.com',
  givenName: 'John',
  familyName: 'Doe',
  middleNames: '',
  suffix: '',
  dateRegistered: new Date('2024-01-01'),
  employment: [
    {
      title: 'Software Engineer',
      institution: 'Tech Corp',
      startYear: 2020,
      startMonth: 1,
      endYear: null,
      endMonth: null,
      ongoing: true,
      department: 'Engineering',
    },
  ],
  education: [
    {
      degree: 'Bachelor of Science',
      institution: 'University of Technology',
      startYear: 2016,
      startMonth: 1,
      endYear: 2020,
      endMonth: 1,
      ongoing: false,
      department: 'Computer Science',
    },
  ],
  social: {
    ssrn: '',
    orcid: '0000-0000-0000-0000',
    github: ['https://github.com/johndoe'],
    scholar: '',
    twitter: ['https://twitter.com/johndoe'],
    linkedIn: ['https://linkedin.com/in/johndoe'],
    impactStory: '',
    baiduScholar: '',
    researchGate: '',
    researcherId: '',
    profileWebsites: ['https://example.com/profile'],
    academiaProfileID: '',
    academiaInstitution: '',
  },
  link: 'https://example.com/profile',
  defaultRegionId: 'us',
  allowIndexing: true,
};

export const MOCK_MEETING: Meeting = {
  id: '1',
  name: 'Test Meeting',
  submissionsCount: 10,
  location: 'New York',
  startDate: new Date('2024-01-15'),
  endDate: new Date('2024-01-16'),
};
