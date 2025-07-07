export const applicationQuestions = [
  {
    id: 'eligibility',
    title: 'YOUR ELIGIBILITY',
    questions: [
      {
        id: 'age',
        type: 'radio',
        label: 'Will you be 18 years of age or older by the time the program starts?',
        required: true,
        options: ['Yes', 'No']
      },
      {
        id: 'income_range',
        type: 'radio',
        label: 'Your annual (gross) personal income is in the following range:',
        required: true,
        options: [
          'I don\'t currently have an income',
          '$1 to $20,000',
          '$20,000 to $44,999',
          '$45,000 or greater'
        ]
      },
      {
        id: 'income_amount',
        type: 'number',
        label: 'Please tell us your annual (gross) personal income.',
        required: true,
        placeholder: 'Enter your annual income'
      },
      {
        id: 'state',
        type: 'select',
        label: 'What state do you live in?',
        required: true,
        options: [
          'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
          'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
          'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
          'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
          'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
          'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
          'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia',
          'Puerto Rico', 'Guam', 'American Samoa', 'U.S. Virgin Islands', 'Northern Mariana Islands'
        ]
      },
      {
        id: 'work_eligibility',
        type: 'radio',
        label: 'Are you able to provide documentation that proves you will be able to work in the U.S. legally by the time the program starts?',
        required: true,
        options: ['Yes', 'No']
      },
      {
        id: 'schedule_availability',
        type: 'radio',
        label: 'Are you available to commute to a fully in-person night + weekend course for at least four to six months?',
        required: true,
        options: ['Yes', 'No']
      },
      {
        id: 'schedule_commitment',
        type: 'radio',
        label: 'Are you available to commit to the following in-person schedule? Mon-Wed, 6:30 PM - 10 PM Sat-Sun, 10 AM - 4 PM',
        required: true,
        options: [
          'I can fully commit to this in-person schedule',
          'I can commit to some of this in-person schedule',
          'I cannot commit to this in-person schedule'
        ]
      },
      {
        id: 'referral_source',
        type: 'select',
        label: 'Now, tell us what encouraged you to apply.',
        required: true,
        options: [
          'Pursuit Fellow',
          'Pursuit Alumnus',
          'Pursuit Community Member',
          'Social Media',
          'Google Search',
          'Friend or Family',
          'School/University',
          'Job Board',
          'Career Fair',
          'Other'
        ]
      },
      {
        id: 'referral_name',
        type: 'text',
        label: 'If a Pursuit Fellow, Alumnus, or community member referred you to Pursuit, please include their full name below.',
        required: false,
        placeholder: 'Enter referrer\'s full name'
      }
    ]
  },
  {
    id: 'personal_info',
    title: 'YOUR PERSONAL INFORMATION',
    questions: [
      {
        id: 'dob',
        type: 'date',
        label: 'What is your date of birth?',
        required: true
      },
      {
        id: 'gender',
        type: 'radio',
        label: 'What is your gender?',
        required: true,
        options: ['Woman', 'Man', 'Non-binary', 'Not listed']
      },
      {
        id: 'phone',
        type: 'tel',
        label: 'What is your primary phone number?',
        required: true,
        placeholder: 'Enter your phone number'
      },
      {
        id: 'address',
        type: 'text',
        label: 'What is your home address?',
        required: true,
        placeholder: 'Enter your home address'
      },
      {
        id: 'nycha',
        type: 'radio',
        label: 'Do you currently live in a NYCHA (New York Housing Authority) development?',
        required: true,
        options: ['Yes', 'No']
      },
      {
        id: 'nycha_residency',
        type: 'text',
        label: 'Which NYCHA Residency?',
        required: false, // Becomes required if nycha = 'Yes'
        placeholder: 'Enter NYCHA residency'
      },
      {
        id: 'city_council_district',
        type: 'text',
        label: 'If you live in NYC, what city council district do you live in? ',
        link: {
          text: 'Find it here',
          url: 'https://council.nyc.gov/map-widget/'
        },
        required: false,
        placeholder: 'Enter city council district'
      },
      {
        id: 'transportation',
        type: 'checkbox',
        label: 'What is your current mode of transportation across/into the city? Please select all that apply',
        required: true,
        options: [
          'I drive or use a motor vehicle',
          'I use public commuter transportation',
          'I walk',
          'I bike'
        ]
      },
      {
        id: 'commute_time',
        type: 'radio',
        label: 'Currently, how long is your commute into the office?',
        required: true,
        options: [
          '0-30 mins',
          '30-60 mins',
          '60-90 mins',
          '90+ mins'
        ]
      },
      {
        id: 'disability',
        type: 'textarea',
        label: 'Pursuit is committed to meeting the requirements of people with disabilities and learning difficulties. Please let us know if you have a disability or learning difficulty and would like to be contacted about accommodations. (optional)',
        required: false,
        placeholder: 'Please describe any accommodations needed'
      },
      {
        id: 'ethnicity',
        type: 'checkbox',
        label: 'Which of the following best represents your racial or ethnic heritage? Choose all that apply.',
        required: true,
        options: [
          'African American/Black',
          'Asian',
          'Hispanic or Latino',
          'Middle Eastern',
          'Native American',
          'White/Caucasian',
          'Other'
        ]
      },
      {
        id: 'english_secondary',
        type: 'radio',
        label: 'Is English your secondary language?',
        required: true,
        options: ['Yes', 'No']
      },
      {
        id: 'born_outside_us',
        type: 'radio',
        label: 'Were you born outside of the US and its territories?',
        required: true,
        options: ['Yes', 'No']
      },
      {
        id: 'parents_born_outside_us',
        type: 'radio',
        label: 'Were your parents born outside of the US and its territories?',
        required: true,
        options: ['Yes', 'No']
      },
      {
        id: 'household_income',
        type: 'number',
        label: 'What is the total annual income of your household?',
        required: true,
        placeholder: 'Enter annual household income'
      },
      {
        id: 'household_status',
        type: 'radio',
        label: 'What is your household Status?',
        required: true,
        options: [
          'Head of Household',
          'Dependent',
          'Neither head of household nor dependent',
          'I\'m not sure'
        ]
      },
      {
        id: 'has_dependents',
        type: 'radio',
        label: 'Do you support any dependents?',
        required: true,
        options: ['Yes', 'No']
      },
      {
        id: 'dependent_type',
        type: 'radio',
        label: 'If yes, please indicate the type of dependent',
        required: false, // Becomes required if has_dependents = 'Yes'
        options: [
          'Minor (17 and younger)',
          'Adult (18 and older)',
          'Both minors and adults',
          'N/A'
        ]
      },
      {
        id: 'number_of_dependents',
        type: 'number',
        label: 'If yes, please indicate the number of dependents you support',
        required: false, // Becomes required if has_dependents = 'Yes'
        min: 0
      },
      {
        id: 'childcare',
        type: 'radio',
        label: 'Do you currently receive child care for your minor dependents?',
        required: false,
        options: [
          'Yes — I provide my child care (stay-at-home parent, primary caregiver)',
          'Yes — I have external childcare (daycare, babysitter, etc.)',
          'No — I do not require childcare/not applicable'
        ]
      },
      {
        id: 'government_assistance',
        type: 'radio',
        label: 'Do you currently receive any government assistance?',
        required: true,
        options: ['Yes', 'No']
      },
      {
        id: 'assistance_types',
        type: 'checkbox',
        label: 'Which forms of government assistance? Please check all that apply.',
        required: false, // Becomes required if government_assistance = 'Yes'
        options: [
          'CILOCA (Child Care in lieu of Cash Assistance)',
          'EITC (Earned Income Tax Credit)',
          'HEAP (Home Energy Assistance Program)',
          'Medicaid',
          'SNAP (Supplemental Nutrition Assistance Program / Food Stamps)',
          'Section 8 Housing',
          'SSDI/SSI (Social Security Disability Insurance and Supplemental Security Income)',
          'SSP (New York State Supplement Program)',
          'TANF (Temporary Assistance for Needy Families)',
          'Unemployment Benefits',
          'WIC (Nutrition Program for Women, Infants, and Children)'
        ]
      },
      {
        id: 'veteran',
        type: 'radio',
        label: 'Are you a veteran?',
        required: true,
        options: ['Yes', 'No']
      },
      {
        id: 'communities',
        type: 'textarea',
        label: 'Are you a part of any communities, groups, or organizations? (i.e. church, clubs, meetups, etc.) Please indicate any/all communities you are currently a part of.',
        required: false,
        placeholder: 'List your communities, groups, or organizations'
      },
      {
        id: 'privacy_policy',
        type: 'checkbox',
        label: 'Please navigate and read the Pursuit Privacy Policy (https://www.pursuit.org/privacy-policy).',
        required: true,
        options: ['I have read and acknowledge Pursuit\'s Privacy Policy']
      }
    ]
  },
  {
    id: 'background',
    title: 'YOUR BACKGROUND',
    questions: [
      {
        id: 'education_level',
        type: 'radio',
        label: 'What is your current highest educational attainment? Please include only the degrees that you hold, not the degrees/diplomas that you are pursuing.',
        required: true,
        options: [
          'Some High School',
          'High School Diploma/GED or Equivalent',
          'Trade or Vocational Degree',
          'Associate Degree',
          'Bachelor\'s Degree',
          'Master\'s Degree',
          'Doctorate'
        ]
      },
      {
        id: 'enrolled_higher_ed',
        type: 'radio',
        label: 'Are you currently enrolled in a higher education degree program?',
        required: true,
        options: ['Yes', 'No']
      },
      {
        id: 'first_gen_college',
        type: 'radio',
        label: 'Are you a first-generation college student? This means that you are currently enrolled in or have graduated from a four-year college or university, and your parent(s)/legal guardian(s) have not completed a bachelor\'s degree at a four-year college or university.',
        required: true,
        options: ['Yes', 'No']
      },
      {
        id: 'degree_type',
        type: 'text',
        label: 'Degree (i.e. Bachelor of Arts)',
        required: false,
        placeholder: 'Enter your degree type'
      },
      {
        id: 'major',
        type: 'text',
        label: 'Major (i.e. "Art History")',
        required: false,
        placeholder: 'Enter your major'
      },
      {
        id: 'college',
        type: 'text',
        label: 'College/University (CUNY)',
        required: false,
        placeholder: 'Enter your college/university'
      },
      {
        id: 'other_college',
        type: 'text',
        label: 'Other College/University (i.e. "NYU")',
        required: false,
        placeholder: 'Enter other college/university'
      },
      {
        id: 'employment_status',
        type: 'radio',
        label: 'What is your current employment status?',
        required: true,
        options: [
          'Employed Full-Time',
          'Employed Part-Time',
          'Self-Employed',
          'Not employed, but looking for work',
          'Not employed and not looking for work',
          'Retired'
        ]
      },
      {
        id: 'work_hours',
        type: 'number',
        label: 'On average, how many hours do you work per week?',
        required: false,
        min: 0,
        max: 168
      },
      {
        id: 'employer',
        type: 'text',
        label: 'Please provide the name of your current or your most recent employer.',
        required: false,
        placeholder: 'Enter employer name'
      },
      {
        id: 'job_title',
        type: 'text',
        label: 'What is your current or most recent job title?',
        required: false,
        placeholder: 'Enter job title'
      },
      {
        id: 'work_history',
        type: 'textarea',
        label: 'Please explain your education and work history in more detail.',
        required: false,
        placeholder: 'Provide details about your education and work history'
      },
      {
        id: 'coding_experience',
        type: 'radio',
        label: 'What\'s your experience with coding?',
        required: true,
        options: [
          'Have never coded before',
          'Just getting started coding',
          'Have built a small coding project',
          'Have a CS degree and/or worked as a developer'
        ]
      },
      {
        id: 'ai_experience',
        type: 'radio',
        label: 'What\'s your experience or understanding of AI?',
        required: true,
        options: [
          'Don\'t really understand AI',
          'Just learning/understanding basic concepts',
          'Have tested/worked with basic AI (ie. meta, ChatGPT)',
          'Have worked/built with AI for a personal/professional product'
        ]
      },
      {
        id: 'linkedin',
        type: 'text',
        label: 'If you have a LinkedIn profile, please add the link below (if you do not have a profile, mark NA):',
        required: false,
        placeholder: 'Enter LinkedIn profile URL or NA'
      },
      {
        id: 'portfolio',
        type: 'text',
        label: 'Is there anything that you have created in the past that you would like to share with us? Please add a link below. (optional)',
        required: false,
        placeholder: 'Enter portfolio or project link'
      }
    ]
  },
  {
    id: 'journey',
    title: 'YOUR JOURNEY',
    questions: [
      {
        id: 'interest_in_pursuit',
        type: 'textarea',
        label: 'Question 1: Pursuit is taking a bold approach to the future by building our AI Native program for the ever-changing landscape of technology. Were there other options you considered before, and what made you decide that Pursuit would be the best vehicle for you?',
        required: true,
        maxLength: 1750, // 350 words * 5 characters per word
        placeholder: 'Please limit your response to 350 words or less'
      },
      {
        id: 'ai_curiosity',
        type: 'textarea',
        label: 'Question 2: Share your thoughts and perspectives on AI. Additionally, tell us how you think AI will help in your work search, career journey, or overall professional growth.',
        required: true,
        maxLength: 1750,
        placeholder: 'Please limit your response to 350 words or less'
      },
      {
        id: 'additional_info',
        type: 'textarea',
        label: 'Question 3: Some applicants have a background, identity, interest, or talent that is so meaningful they believe their application would be incomplete without it. If this sounds like you, then please share your story.',
        required: false,
        maxLength: 1750,
        placeholder: 'Please limit your response to 350 words or less'
      },
      {
        id: 'x_handle',
        type: 'text',
        label: 'Please create (if you do not already have one) an X account and share your handle here. Note: this is a requirement for the program.',
        required: true,
        placeholder: 'Enter your X (Twitter) handle'
      }
    ]
  },
  {
    id: 'ai_assignment',
    title: 'AI ASSESSMENT',
    questions: [
      {
        id: 'ai_questions',
        type: 'textarea',
        label: '1. List all of the questions you used to ask the AI to learn. (The more and the deeper the better.)',
        required: true,
        placeholder: 'List your questions'
      },
      {
        id: 'neural_network_explanation',
        type: 'textarea',
        label: '2. Explain, in your own words, what a neural network is.',
        required: true,
        placeholder: 'Explain neural networks in your own words'
      },
      {
        id: 'neural_network_structure',
        type: 'textarea',
        label: '3. What is the basic structure and function of a neural network?',
        required: true,
        placeholder: 'Describe the structure and function'
      },
      {
        id: 'neural_network_components',
        type: 'textarea',
        label: '4. What are the main components of a neural network?',
        required: true,
        placeholder: 'List and describe the components'
      },
      {
        id: 'intriguing_aspect',
        type: 'textarea',
        label: '5. What aspect of neural networks did you find most intriguing during your research?',
        required: true,
        placeholder: 'Share what intrigued you most'
      },
      {
        id: 'further_exploration',
        type: 'textarea',
        label: '6. Name one area you would like to explore further.',
        required: true,
        placeholder: 'Describe what you want to explore'
      },
      {
        id: 'further_learning',
        type: 'textarea',
        label: '7. What did you learn about this new aspect you listed above? (optional)',
        required: false,
        placeholder: 'Share what you learned'
      },
      {
        id: 'ai_learning_reflection',
        type: 'textarea',
        label: '8. How did using AI tools to learn about a new topic influence your learning process, and what insights did you gain about integrating AI into your learning practices?',
        required: true,
        placeholder: 'Reflect on your learning experience with AI'
      }
    ]
  }
]; 