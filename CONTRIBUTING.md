# Contributing to AI-Driven Support Platform

Thank you for your interest in contributing! This guide will help you get started.

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-driven-support-platform.git
   cd ai-driven-support-platform
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Set up your environment** (see SETUP.md)

## Development Workflow

### 1. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Your Changes
- Write clean, maintainable code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes
```bash
# Backend tests
cd apps/backend
npm test

# Frontend tests
cd apps/frontend
npm test

# Manual testing
npm run dev
```

### 4. Commit Your Changes
```bash
git add .
git commit -m "feat: add new feature"
# or
git commit -m "fix: resolve bug in ticket creation"
```

**Commit Message Format**:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### 5. Push and Create PR
```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Code Style Guidelines

### TypeScript/JavaScript
- Use TypeScript strict mode
- Prefer `const` over `let`
- Use async/await over promises
- Use descriptive variable names
- Add JSDoc comments for public APIs

**Example**:
```typescript
/**
 * Creates a new ticket with AI analysis
 * @param title - Ticket title
 * @param description - Detailed description
 * @param userId - ID of the requesting user
 * @returns Created ticket with AI suggestions
 */
async createTicket(title: string, description: string, userId: string): Promise<Ticket> {
  // Implementation
}
```

### React Components
- Use functional components with hooks
- Keep components small and focused
- Use TypeScript for props
- Add prop types

**Example**:
```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ label, onClick, variant = 'primary' }) => {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {label}
    </button>
  );
};
```

### Backend Services
- Use dependency injection
- Keep services focused on single responsibility
- Add error handling
- Log important operations

**Example**:
```typescript
@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private aiService: AIService,
  ) {}

  async create(data: CreateTicketDto): Promise<Ticket> {
    try {
      // Business logic
      const analysis = await this.aiService.analyze(data);
      return await this.prisma.ticket.create({ data: { ...data, ...analysis } });
    } catch (error) {
      this.logger.error('Failed to create ticket', error);
      throw new InternalServerErrorException('Failed to create ticket');
    }
  }
}
```

## Testing Guidelines

### Backend Tests
```typescript
describe('TicketsService', () => {
  let service: TicketsService;
  
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [TicketsService, PrismaService, AIService],
    }).compile();
    
    service = module.get<TicketsService>(TicketsService);
  });

  it('should create a ticket', async () => {
    const result = await service.create({
      title: 'Test ticket',
      description: 'Test description',
      userId: 'user-id',
    });
    
    expect(result).toBeDefined();
    expect(result.title).toBe('Test ticket');
  });
});
```

### Frontend Tests
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button label="Click me" onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Pull Request Guidelines

### Before Submitting
- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] No commented-out code
- [ ] Commit messages are clear

### PR Description Template
```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested your changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have tested my changes
- [ ] I have updated the documentation
- [ ] I have added tests
```

## Areas for Contribution

### High Priority
- [ ] Add comprehensive tests (backend and frontend)
- [ ] Implement vector database for AI (Pinecone/Chroma)
- [ ] Add toolchain integrations (AWS, Azure, GitHub, etc.)
- [ ] Improve error handling and validation
- [ ] Add rate limiting
- [ ] Implement file attachments

### Medium Priority
- [ ] Add email notifications
- [ ] Slack integration
- [ ] Advanced analytics dashboard
- [ ] Ticket templates
- [ ] SLA tracking
- [ ] Multi-language support

### Low Priority
- [ ] Dark mode improvements
- [ ] Mobile app
- [ ] Advanced reporting
- [ ] Audit logs
- [ ] Webhooks
- [ ] API documentation with Swagger

## Reporting Issues

### Bug Reports
Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots/logs
- Environment details

**Template**:
```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Ubuntu 22.04]
- Node version: [e.g., 20.10.0]
- Browser: [e.g., Chrome 120]
```

### Feature Requests
Include:
- Use case
- Proposed solution
- Alternatives considered
- Additional context

## Code Review Process

1. **Automated Checks**: CI/CD runs tests and linting
2. **Peer Review**: At least one approving review required
3. **Maintainer Review**: Final review by maintainer
4. **Merge**: Squash and merge into main branch

## Community Guidelines

- Be respectful and inclusive
- Help others learn
- Provide constructive feedback
- Follow the code of conduct

## Questions?

- Open an issue for questions
- Join discussions on GitHub Discussions
- Check existing issues and PRs first

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing! 🎉
