export const templates = {
  empty: {
    metadata: {
      name: 'New C4 Model',
      version: '1.0',
      author: 'Solution Architect',
    },
    systems: [],
    containers: [],
    components: [],
    people: [],
    externalSystems: [],
    relationships: [],
  },

  flightOperations: {
    metadata: {
      name: 'Flight Operations System',
      version: '1.0',
      author: 'Solution Architect',
    },
    systems: [
      {
        id: 'sys-fico',
        type: 'system',
        name: 'FICO',
        description: 'Flight Information & Control of Operations - Core system managing all flight operations',
        technology: '',
        position: { x: 300, y: 200 },
      },
      {
        id: 'sys-crew',
        type: 'system',
        name: 'Crew Management',
        description: 'Manages crew scheduling and assignments',
        technology: '',
        position: { x: 600, y: 200 },
      },
    ],
    containers: [
      {
        id: 'cont-api-gateway',
        type: 'container',
        name: 'API Gateway',
        description: 'REST API Gateway for external integrations',
        technology: 'Spring Boot',
        parentSystem: 'sys-fico',
        position: { x: 250, y: 400 },
      },
      {
        id: 'cont-web-app',
        type: 'container',
        name: 'Web Application',
        description: 'Flight operations web interface',
        technology: 'React',
        parentSystem: 'sys-fico',
        position: { x: 450, y: 400 },
      },
      {
        id: 'cont-database',
        type: 'container',
        name: 'Flight Database',
        description: 'Stores flight and operations data',
        technology: 'PostgreSQL',
        parentSystem: 'sys-fico',
        position: { x: 350, y: 550 },
      },
    ],
    people: [
      {
        id: 'person-dispatcher',
        type: 'person',
        name: 'Flight Dispatcher',
        description: 'Manages and monitors flight operations',
        position: { x: 100, y: 200 },
      },
      {
        id: 'person-pilot',
        type: 'person',
        name: 'Pilot',
        description: 'Accesses flight information',
        position: { x: 100, y: 350 },
      },
    ],
    externalSystems: [
      {
        id: 'ext-weather',
        type: 'externalSystem',
        name: 'Weather Service',
        description: 'Provides weather data',
        position: { x: 600, y: 400 },
      },
    ],
    relationships: [
      {
        id: 'rel-1',
        from: 'person-dispatcher',
        to: 'cont-web-app',
        description: 'Uses to manage flights',
        technology: 'HTTPS',
      },
      {
        id: 'rel-2',
        from: 'person-pilot',
        to: 'cont-web-app',
        description: 'Views flight information',
        technology: 'HTTPS',
      },
      {
        id: 'rel-3',
        from: 'cont-web-app',
        to: 'cont-api-gateway',
        description: 'Makes API calls',
        technology: 'REST/JSON',
      },
      {
        id: 'rel-4',
        from: 'cont-api-gateway',
        to: 'cont-database',
        description: 'Reads from and writes to',
        technology: 'JDBC',
      },
      {
        id: 'rel-5',
        from: 'cont-api-gateway',
        to: 'ext-weather',
        description: 'Retrieves weather data',
        technology: 'REST/JSON',
      },
      {
        id: 'rel-6',
        from: 'sys-fico',
        to: 'sys-crew',
        description: 'Shares crew assignments',
        technology: 'REST API',
      },
    ],
  },

  microservices: {
    metadata: {
      name: 'E-Commerce Microservices Architecture',
      version: '1.0',
      author: 'Solution Architect',
    },
    systems: [
      {
        id: 'sys-ecommerce',
        type: 'system',
        name: 'E-Commerce Platform',
        description: 'Online shopping platform',
        technology: '',
        position: { x: 400, y: 150 },
      },
    ],
    containers: [
      {
        id: 'cont-frontend',
        type: 'container',
        name: 'Web Frontend',
        description: 'Customer-facing web application',
        technology: 'React/Next.js',
        parentSystem: 'sys-ecommerce',
        position: { x: 400, y: 300 },
      },
      {
        id: 'cont-api-gateway',
        type: 'container',
        name: 'API Gateway',
        description: 'Routes requests to microservices',
        technology: 'Kong/Nginx',
        parentSystem: 'sys-ecommerce',
        position: { x: 400, y: 450 },
      },
      {
        id: 'cont-product-service',
        type: 'container',
        name: 'Product Service',
        description: 'Manages product catalog',
        technology: 'Node.js',
        parentSystem: 'sys-ecommerce',
        position: { x: 200, y: 600 },
      },
      {
        id: 'cont-order-service',
        type: 'container',
        name: 'Order Service',
        description: 'Processes customer orders',
        technology: 'Java/Spring Boot',
        parentSystem: 'sys-ecommerce',
        position: { x: 400, y: 600 },
      },
      {
        id: 'cont-payment-service',
        type: 'container',
        name: 'Payment Service',
        description: 'Handles payment processing',
        technology: 'Python/FastAPI',
        parentSystem: 'sys-ecommerce',
        position: { x: 600, y: 600 },
      },
    ],
    people: [
      {
        id: 'person-customer',
        type: 'person',
        name: 'Customer',
        description: 'Shops online',
        position: { x: 400, y: 50 },
      },
    ],
    externalSystems: [
      {
        id: 'ext-payment-gateway',
        type: 'externalSystem',
        name: 'Payment Gateway',
        description: 'External payment processor',
        position: { x: 750, y: 600 },
      },
    ],
    relationships: [
      {
        id: 'rel-1',
        from: 'person-customer',
        to: 'cont-frontend',
        description: 'Browses and purchases products',
        technology: 'HTTPS',
      },
      {
        id: 'rel-2',
        from: 'cont-frontend',
        to: 'cont-api-gateway',
        description: 'Makes API requests',
        technology: 'REST/JSON',
      },
      {
        id: 'rel-3',
        from: 'cont-api-gateway',
        to: 'cont-product-service',
        description: 'Routes product requests',
        technology: 'HTTP/REST',
      },
      {
        id: 'rel-4',
        from: 'cont-api-gateway',
        to: 'cont-order-service',
        description: 'Routes order requests',
        technology: 'HTTP/REST',
      },
      {
        id: 'rel-5',
        from: 'cont-api-gateway',
        to: 'cont-payment-service',
        description: 'Routes payment requests',
        technology: 'HTTP/REST',
      },
      {
        id: 'rel-6',
        from: 'cont-order-service',
        to: 'cont-payment-service',
        description: 'Initiates payment',
        technology: 'Event-driven/Kafka',
        animated: true,
      },
      {
        id: 'rel-7',
        from: 'cont-payment-service',
        to: 'ext-payment-gateway',
        description: 'Processes payment',
        technology: 'REST API',
      },
    ],
  },

  layeredArchitecture: {
    metadata: {
      name: 'Layered Web Application',
      version: '1.0',
      author: 'Solution Architect',
    },
    systems: [
      {
        id: 'sys-webapp',
        type: 'system',
        name: 'Web Application',
        description: 'Enterprise web application',
        technology: '',
        position: { x: 350, y: 150 },
      },
    ],
    components: [
      {
        id: 'comp-presentation',
        type: 'component',
        name: 'Presentation Layer',
        description: 'UI controllers and views',
        technology: 'Spring MVC',
        position: { x: 350, y: 300 },
      },
      {
        id: 'comp-business',
        type: 'component',
        name: 'Business Logic Layer',
        description: 'Business rules and workflows',
        technology: 'Java Services',
        position: { x: 350, y: 400 },
      },
      {
        id: 'comp-data',
        type: 'component',
        name: 'Data Access Layer',
        description: 'Repository pattern',
        technology: 'Spring Data JPA',
        position: { x: 350, y: 500 },
      },
      {
        id: 'comp-db',
        type: 'component',
        name: 'Database',
        description: 'Relational database',
        technology: 'MySQL',
        position: { x: 350, y: 600 },
      },
    ],
    people: [
      {
        id: 'person-user',
        type: 'person',
        name: 'User',
        description: 'Application user',
        position: { x: 350, y: 50 },
      },
    ],
    externalSystems: [],
    relationships: [
      {
        id: 'rel-1',
        from: 'person-user',
        to: 'comp-presentation',
        description: 'Interacts with',
        technology: 'HTTPS',
      },
      {
        id: 'rel-2',
        from: 'comp-presentation',
        to: 'comp-business',
        description: 'Calls',
        technology: 'Method calls',
      },
      {
        id: 'rel-3',
        from: 'comp-business',
        to: 'comp-data',
        description: 'Uses',
        technology: 'Method calls',
      },
      {
        id: 'rel-4',
        from: 'comp-data',
        to: 'comp-db',
        description: 'Reads/Writes',
        technology: 'JDBC/SQL',
      },
    ],
  },
};

export const getTemplateNames = () => {
  return Object.keys(templates).map((key) => ({
    key,
    name: templates[key].metadata.name,
  }));
};

export const getTemplate = (key) => {
  return templates[key] || templates.empty;
};
