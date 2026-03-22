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

  var vpTitles = [
    'VP of Engineering', 'VP of Product Development', 'VP of Commercial', 'VP of Consulting',
    'VP of Customer Success', 'VP of Marketing', 'CFO', 'VP of Risk',
    'VP of Supplier Relations', 'CISO', 'VP of IT Support', 'VP of Infrastructure'
  ];

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
    users.push({
      id: id,
      parentId: parentId,
      displayName: name,
      jobTitle: title,
      department: dept,
      mail: email,
      officeLocation: office,
      startDate: randomStartDate(),
      photo: null
    });
    return id;
  }

  function makeName() {
    return pick(firstNames) + ' ' + pick(lastNames);
  }

  // CEO
  var ceoId = addUser(null, 'Sarah Chen', 'CEO', 'Executive', 'UK');

  // VPs (one per department)
  var vpIds = [];
  for (var d = 0; d < departments.length; d++) {
    var vpId = addUser(ceoId, makeName(), vpTitles[d], departments[d], pick(officeWeights));
    vpIds.push({ id: vpId, dept: departments[d] });
  }

  // Managers (~4 per VP = ~48 managers)
  var mgrIds = [];
  for (var v = 0; v < vpIds.length; v++) {
    var dept = vpIds[v].dept;
    var titles = managerTitles[dept];
    var numManagers = 3 + Math.floor(rand() * 3); // 3-5 managers per VP
    for (var m = 0; m < numManagers; m++) {
      var mgrId = addUser(vpIds[v].id, makeName(), titles[m % titles.length], dept, pick(officeWeights));
      mgrIds.push({ id: mgrId, dept: dept });
    }
  }

  // ICs: each manager gets 3-7 direct reports
  for (var i = 0; i < mgrIds.length; i++) {
    var mgr = mgrIds[i];
    var numReports = 3 + Math.floor(rand() * 5); // 3-7 direct reports
    var titles2 = icTitles[mgr.dept];
    for (var r = 0; r < numReports; r++) {
      addUser(mgr.id, makeName(), pick(titles2), mgr.dept, pick(officeWeights));
    }
  }

  return users;
};
