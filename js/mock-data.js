var WhosWho = window.WhosWho || (window.WhosWho = {});

WhosWho.generateMockData = function () {
  // Deterministic pseudo-random (mulberry32)
  var _seed = 12345;
  function rand() {
    _seed |= 0; _seed = _seed + 0x6D2B79F5 | 0;
    var t = Math.imul(_seed ^ _seed >>> 15, 1 | _seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }
  function pickN(arr, n) {
    var copy = arr.slice(), out = [];
    for (var i = 0; i < n && copy.length; i++) {
      var idx = Math.floor(rand() * copy.length);
      out.push(copy.splice(idx, 1)[0]);
    }
    return out;
  }

  var firstNames = [
    'James','Mary','Robert','Patricia','John','Jennifer','Michael','Linda','David','Elizabeth',
    'William','Barbara','Richard','Susan','Joseph','Jessica','Thomas','Sarah','Charles','Karen',
    'Christopher','Lisa','Daniel','Nancy','Matthew','Betty','Anthony','Margaret','Mark','Sandra',
    'Andrew','Ashley','Steven','Emily','Paul','Donna','Joshua','Michelle','Kenneth','Carol',
    'Wei','Yuki','Raj','Priya','Hiroshi','Mei','Arjun','Fatima','Jin','Soo',
    'Carlos','Ana','Pedro','Lucia','Diego','Isabella','Marco','Sofia','Liam','Olivia',
    'Ethan','Ava','Noah','Mia','Lucas','Aisha','Omar','Yuna','Kenji','Sakura',
    'Ravi','Deepa','Vikram','Ananya','Sanjay','Kavita','Amit','Nisha','Suresh','Lakshmi',
    'Connor','Siobhan','Declan','Aoife','Padraig','Ciara','Sean','Niamh','Callum','Freya',
    'Hans','Ingrid','Klaus','Greta','Lars','Hana','Tomoko','Akira','Yuto','Haruki'
  ];

  var lastNames = [
    'Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez',
    'Hernandez','Lopez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee',
    'Chen','Wang','Li','Zhang','Liu','Yang','Huang','Wu','Zhou','Xu',
    'Kim','Park','Choi','Jung','Kang','Cho','Yoon','Jang','Lim','Han',
    'Tanaka','Suzuki','Watanabe','Sato','Yamamoto','Nakamura','Kobayashi','Takahashi','Ito','Saito',
    'Patel','Sharma','Singh','Kumar','Gupta','Verma','Mehta','Shah','Rao','Das',
    'Silva','Santos','Oliveira','Ferreira','Costa','Pereira','Almeida','Ribeiro','Carvalho','Gomes',
    'Mueller','Schmidt','Schneider','Fischer','Weber','Meyer','Wagner','Becker','Schulz','Hoffmann',
    'Murphy','Kelly','OBrien','Ryan','Sullivan','Walsh','Burke','Doyle','Lynch','Murray',
    'Thompson','White','Harris','Clark','Lewis','Robinson','Walker','Young','Allen','King'
  ];

  var departments = [
    'Engineering', 'Product Development', 'Commercial', 'Consulting',
    'Customer Success', 'Marketing', 'Finance', 'Risk',
    'Supplier', 'Information Security', 'IT Support', 'Infrastructure'
  ];

  var offices = [
    'UK', 'US', 'China', 'Singapore', 'Malaysia', 'Australia',
    'Northern Ireland', 'Canada', 'Brazil', 'Germany', 'Japan', 'South Korea', 'India'
  ];

  // Weight offices (UK and US have more people)
  var officeWeights = [
    'UK','UK','UK','UK','UK',
    'US','US','US','US',
    'China','China',
    'Singapore','Singapore',
    'India','India','India',
    'Germany','Germany',
    'Japan','Japan',
    'Australia','Australia',
    'Malaysia',
    'Canada','Canada',
    'Brazil',
    'Northern Ireland',
    'South Korea'
  ];

  // C-suite: 6 executives report to CEO (max 6 direct reports)
  var cSuite = [
    { name: 'Tony Yoxall',  title: 'COO',  depts: ['Commercial', 'Consulting'] },
    { name: null,            title: 'CTO',  depts: ['Engineering', 'Infrastructure'] },
    { name: null,            title: 'CPO',  depts: ['Product Development', 'Customer Success'] },
    { name: null,            title: 'CMO',  depts: ['Marketing', 'Supplier'] },
    { name: null,            title: 'CFO',  depts: ['Finance', 'Risk'] },
    { name: null,            title: 'CIO',  depts: ['Information Security', 'IT Support'] }
  ];

  var vpTitles = {
    'Engineering': 'VP of Engineering',
    'Product Development': 'VP of Product Development',
    'Commercial': 'VP of Commercial',
    'Consulting': 'VP of Consulting',
    'Customer Success': 'VP of Customer Success',
    'Marketing': 'VP of Marketing',
    'Finance': 'VP of Finance',
    'Risk': 'VP of Risk',
    'Supplier': 'VP of Supplier Relations',
    'Information Security': 'VP of Information Security',
    'IT Support': 'VP of IT Support',
    'Infrastructure': 'VP of Infrastructure'
  };

  var managerTitles = {
    'Engineering': ['Engineering Manager', 'Senior Engineering Manager', 'Principal Engineer', 'Staff Engineer'],
    'Product Development': ['Product Manager', 'Senior Product Manager', 'Product Lead', 'Development Manager'],
    'Commercial': ['Sales Manager', 'Business Development Manager', 'Account Director', 'Commercial Lead'],
    'Consulting': ['Consulting Manager', 'Senior Consultant Lead', 'Practice Manager', 'Engagement Manager'],
    'Customer Success': ['CS Manager', 'Customer Success Lead', 'Support Manager', 'Client Relations Manager'],
    'Marketing': ['Marketing Manager', 'Campaign Manager', 'Brand Manager', 'Digital Marketing Lead'],
    'Finance': ['Finance Manager', 'Financial Controller', 'Senior Accountant', 'FP&A Manager'],
    'Risk': ['Risk Manager', 'Compliance Manager', 'Risk Analyst Lead', 'Audit Manager'],
    'Supplier': ['Supplier Manager', 'Procurement Lead', 'Vendor Relations Manager', 'Supply Chain Manager'],
    'Information Security': ['Security Manager', 'SOC Lead', 'Security Architect', 'GRC Manager'],
    'IT Support': ['IT Manager', 'Service Desk Lead', 'Systems Manager', 'Technical Support Manager'],
    'Infrastructure': ['Infrastructure Manager', 'Cloud Operations Lead', 'Network Manager', 'Platform Manager']
  };

  var icTitles = {
    'Engineering': ['Software Engineer', 'Senior Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'QA Engineer', 'DevOps Engineer', 'Data Engineer'],
    'Product Development': ['Product Analyst', 'UX Designer', 'UI Developer', 'Product Specialist', 'Technical Writer', 'UX Researcher'],
    'Commercial': ['Account Executive', 'Sales Representative', 'Business Development Rep', 'Sales Analyst', 'Account Manager', 'Revenue Analyst'],
    'Consulting': ['Consultant', 'Senior Consultant', 'Business Analyst', 'Solutions Architect', 'Implementation Specialist'],
    'Customer Success': ['Customer Success Manager', 'Support Specialist', 'Technical Support Engineer', 'Customer Advocate', 'Onboarding Specialist'],
    'Marketing': ['Marketing Specialist', 'Content Writer', 'SEO Specialist', 'Social Media Manager', 'Graphic Designer', 'Marketing Analyst'],
    'Finance': ['Accountant', 'Financial Analyst', 'Payroll Specialist', 'Tax Analyst', 'Billing Specialist', 'Treasury Analyst'],
    'Risk': ['Risk Analyst', 'Compliance Analyst', 'Internal Auditor', 'Fraud Analyst', 'Regulatory Specialist'],
    'Supplier': ['Procurement Analyst', 'Supplier Coordinator', 'Vendor Analyst', 'Contract Specialist', 'Sourcing Specialist'],
    'Information Security': ['Security Analyst', 'Penetration Tester', 'Security Engineer', 'SOC Analyst', 'GRC Analyst'],
    'IT Support': ['IT Support Specialist', 'Help Desk Analyst', 'Systems Administrator', 'Desktop Support', 'IT Technician'],
    'Infrastructure': ['Systems Engineer', 'Cloud Engineer', 'Network Engineer', 'Site Reliability Engineer', 'Database Administrator', 'Platform Engineer']
  };

  var skillsList = [
    'Leadership', 'Strategic Planning', 'Agile', 'Scrum', 'Project Management',
    'Data Analysis', 'Machine Learning', 'Python', 'JavaScript', 'TypeScript',
    'React', 'Angular', 'Node.js', 'SQL', 'Cloud Architecture', 'AWS', 'Azure',
    'DevOps', 'CI/CD', 'Docker', 'Kubernetes', 'Microservices', 'REST APIs',
    'Communication', 'Stakeholder Management', 'Budgeting', 'Negotiation',
    'UX Design', 'Product Strategy', 'Market Research', 'Sales Strategy',
    'Risk Assessment', 'Compliance', 'Financial Modelling', 'Cybersecurity',
    'Networking', 'System Administration', 'Technical Writing', 'Mentoring'
  ];

  var interestsList = [
    'Running', 'Photography', 'Cooking', 'Reading', 'Travel', 'Hiking',
    'Music', 'Cycling', 'Yoga', 'Gaming', 'Gardening', 'Volunteering',
    'Board Games', 'Tennis', 'Swimming', 'Painting', 'Chess', 'Podcasts',
    'Film', 'Rock Climbing', 'Coffee', 'Wine Tasting', 'Skiing', 'Football'
  ];

  var responsibilitiesList = {
    'Executive': ['Setting company strategy', 'Board reporting', 'P&L ownership', 'Cross-functional alignment'],
    'Engineering': ['Code review', 'System design', 'Sprint planning', 'Technical mentoring', 'Production support'],
    'Product Development': ['Roadmap planning', 'User research', 'Feature prioritisation', 'Stakeholder alignment'],
    'Commercial': ['Revenue targets', 'Client relationships', 'Pipeline management', 'Contract negotiation'],
    'Consulting': ['Client delivery', 'Solution design', 'Project scoping', 'Team utilisation'],
    'Customer Success': ['Account health', 'Onboarding', 'Retention strategy', 'Escalation handling'],
    'Marketing': ['Campaign execution', 'Brand management', 'Content strategy', 'Analytics reporting'],
    'Finance': ['Financial reporting', 'Budget management', 'Forecasting', 'Audit preparation'],
    'Risk': ['Risk assessment', 'Policy development', 'Regulatory compliance', 'Incident response'],
    'Supplier': ['Vendor evaluation', 'Contract management', 'Cost optimisation', 'SLA monitoring'],
    'Information Security': ['Threat monitoring', 'Security audits', 'Policy enforcement', 'Incident response'],
    'IT Support': ['Service desk management', 'System maintenance', 'User provisioning', 'Asset management'],
    'Infrastructure': ['Capacity planning', 'Network management', 'Cloud operations', 'Disaster recovery']
  };

  var aboutMeTemplates = [
    'Passionate about {interest1} and {interest2}. {years}+ years in {field} with a focus on delivering results.',
    'Experienced {field} professional who enjoys {interest1} outside of work. Always looking to learn and grow.',
    'Dedicated team player with a background in {field}. Outside the office, you\'ll find me {interest1} or {interest2}.',
    'Driven by curiosity and a love for {field}. When not working, I enjoy {interest1} and {interest2}.',
    '{years}+ years of experience in {field}. I believe in collaboration, continuous improvement, and {interest1}.'
  ];

  var cityByOffice = {
    'UK': ['London', 'Belfast'],
    'US': ['Chicago', 'New York'],
    'China': ['Shanghai'],
    'Singapore': ['Singapore'],
    'Malaysia': ['Kuala Lumpur'],
    'Australia': ['Sydney', 'Melbourne'],
    'Northern Ireland': ['Belfast'],
    'Canada': ['Toronto'],
    'Brazil': ['Sao Paulo'],
    'Germany': ['Dusseldorf'],
    'Japan': ['Tokyo'],
    'South Korea': ['Seoul'],
    'India': ['Mumbai', 'Bangalore']
  };

  var users = [];
  var nextId = 1;
  var now = new Date();

  function randomStartDate() {
    // ~8% chance of being a new joiner (within last 30 days)
    if (rand() < 0.08) {
      var daysAgo = Math.floor(rand() * 30);
      var d = new Date(now);
      d.setDate(d.getDate() - daysAgo);
      return d.toISOString().split('T')[0];
    }
    // Otherwise random date 1-5 years ago
    var yearsAgo = 1 + rand() * 4;
    var d2 = new Date(now);
    d2.setFullYear(d2.getFullYear() - Math.floor(yearsAgo));
    d2.setMonth(Math.floor(rand() * 12));
    d2.setDate(1 + Math.floor(rand() * 27));
    return d2.toISOString().split('T')[0];
  }

  function addUser(parentId, name, title, dept, office) {
    var id = String(nextId++);
    var email = name.toLowerCase().replace(/[^a-z ]/g, '').replace(/ /g, '.') + '@mintelgroup.com';
    var cities = cityByOffice[office] || [office];
    var city = pick(cities);
    var phoneArea = Math.floor(100 + rand() * 900);
    var phoneLine = Math.floor(1000 + rand() * 9000);
    var years = Math.floor(2 + rand() * 18);
    var mySkills = pickN(skillsList, 3 + Math.floor(rand() * 4));
    var myInterests = pickN(interestsList, 2 + Math.floor(rand() * 3));
    var myResps = responsibilitiesList[dept] || responsibilitiesList['Engineering'];
    var aboutTpl = pick(aboutMeTemplates);
    var aboutMe = aboutTpl
      .replace('{interest1}', myInterests[0] ? myInterests[0].toLowerCase() : 'learning')
      .replace('{interest2}', myInterests[1] ? myInterests[1].toLowerCase() : 'teamwork')
      .replace('{years}', String(years))
      .replace('{field}', dept);
    users.push({
      id: id,
      parentId: parentId,
      displayName: name,
      jobTitle: title,
      department: dept,
      mail: email,
      officeLocation: office,
      city: city,
      country: office,
      businessPhones: ['+' + phoneArea + ' ' + phoneLine + ' ' + Math.floor(1000 + rand() * 9000)],
      mobilePhone: '+' + phoneArea + ' ' + phoneLine + ' ' + Math.floor(1000 + rand() * 9000),
      startDate: randomStartDate(),
      aboutMe: aboutMe,
      skills: mySkills,
      interests: myInterests,
      responsibilities: pickN(myResps, 2 + Math.floor(rand() * 2)),
      photo: null
    });
    return id;
  }

  function makeName() {
    return pick(firstNames) + ' ' + pick(lastNames);
  }

  // CEO
  var ceoId = addUser(null, 'Sarah Chen', 'CEO', 'Executive', 'UK');

  // C-suite (6 direct reports to CEO, each overseeing 2 department VPs)
  var vpIds = [];
  for (var cs = 0; cs < cSuite.length; cs++) {
    var exec = cSuite[cs];
    var execId = addUser(ceoId, exec.name || makeName(), exec.title, 'Executive', pick(officeWeights));
    for (var di = 0; di < exec.depts.length; di++) {
      var dept = exec.depts[di];
      var vpId = addUser(execId, makeName(), vpTitles[dept], dept, pick(officeWeights));
      vpIds.push({ id: vpId, dept: dept });
    }
  }

  // Managers (4-6 per VP)
  var mgrIds = [];
  for (var v = 0; v < vpIds.length; v++) {
    var dept = vpIds[v].dept;
    var titles = managerTitles[dept];
    var numManagers = 4 + Math.floor(rand() * 3); // 4-6 managers per VP
    for (var m = 0; m < numManagers; m++) {
      var mgrId = addUser(vpIds[v].id, makeName(), titles[m % titles.length], dept, pick(officeWeights));
      mgrIds.push({ id: mgrId, dept: dept });
    }
  }

  // ICs (4-6 per manager)
  for (var mi = 0; mi < mgrIds.length; mi++) {
    var mgr = mgrIds[mi];
    var titles2 = icTitles[mgr.dept];
    var numICs = 4 + Math.floor(rand() * 3); // 4-6 ICs per manager
    for (var ic = 0; ic < numICs; ic++) {
      addUser(mgr.id, makeName(), pick(titles2), mgr.dept, pick(officeWeights));
    }
  }

  return users;
};
