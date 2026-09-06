# SOLID Design Principles

- **Single Responsibility Principle (SRP)**: Each component, custom hook, service, and utility must serve one clear purpose and have only one reason to change. Separate presentation from business logic and data access.
- **Open/Closed Principle (OCP)**: Design components and functions to be extensible (via composition, props, and callbacks) without needing to rewrite existing verified code.
- **Liskov Substitution Principle (LSP)**: Ensure that implementations, variants, and interchangeable utilities strictly honor contract types and interfaces without unexpected divergence in behavior.
- **Interface Segregation Principle (ISP)**: Keep TypeScript types and component props minimal and specific. Do not force components or consumers to depend on broad, unused interfaces.
- **Dependency Inversion Principle (DIP)**: UI components should depend on abstractions (hooks, services, and shared types) rather than tightly coupled low-level implementations (such as direct file-system, database, or device APIs).
