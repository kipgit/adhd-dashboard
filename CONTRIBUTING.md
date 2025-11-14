# Contributing to ADHD Dashboard

First off, thank you for considering contributing to ADHD Dashboard! 💚

## Core Principles

When contributing, please keep these ADHD-friendly principles in mind:

1. **Reduce cognitive load**, never add to it
2. **Simplicity over features**
3. **Grace over guilt**
4. **Flexibility over rigidity**
5. **Positive framing always**

## Code of Conduct

Be kind, be respectful, be inclusive. We're building for a neurodivergent community that deserves compassion and understanding.

## How to Contribute

### Reporting Bugs

When reporting bugs, please include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Your environment (OS, Node version, etc.)

**IMPORTANT**: Never include:
- Shame language ("this is broken", "doesn't work")
- User blame ("you did X wrong")
- Frustration venting

Frame issues constructively: "When I do X, I expect Y, but Z happens instead."

### Suggesting Features

We love new ideas! When suggesting features:

1. Explain the ADHD-related problem it solves
2. Describe how it reduces cognitive load or decision fatigue
3. Consider if it adds complexity (complexity is the enemy!)
4. Think about "survival mode" - does it work for low-energy days?

### Code Contributions

#### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-adhd-feature`
3. Make your changes
4. Test thoroughly
5. Commit with clear messages
6. Push and create a Pull Request

#### Code Style

- Use TypeScript
- Follow existing patterns
- Write clear, descriptive variable names
- Add comments for complex logic
- Keep functions small and focused

#### Testing

- Write tests for new features
- Ensure existing tests pass
- Test with different energy levels/survival mode
- Consider accessibility implications

#### Commit Messages

Use clear, action-oriented commit messages:

- ✅ "Add gentle reminder for old tasks"
- ✅ "Fix celebration triggering twice"
- ✅ "Improve time translation accuracy"
- ❌ "Update stuff"
- ❌ "Fix bug"

### Pull Request Process

1. Update documentation if needed
2. Add tests for new functionality
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Request review from maintainers

## ADHD-Friendly Development Tips

### When Writing Code

- **Keep it simple**: If you need extensive comments to explain it, it's too complex
- **One thing at a time**: Don't mix refactoring with new features
- **Break it down**: Large PRs are overwhelming - keep them focused
- **Celebrate progress**: Small wins matter!

### When Reviewing Code

- **Be kind**: Assume good intentions
- **Be specific**: "This could be clearer" → "Consider renaming `x` to `userEnergyLevel`"
- **Offer solutions**: Don't just point out problems
- **Acknowledge effort**: Say "nice work on X!"

### When Stuck

- Take a break
- Ask for help (seriously, we all get stuck!)
- Break the problem into smaller pieces
- Come back with fresh eyes

## Error Message Guidelines

All user-facing messages must:

1. **Never blame**: "Something went wrong" not "You entered invalid data"
2. **Offer help**: "Want to try again?" not just "Error"
3. **Use plain language**: "Email already exists" not "Unique constraint violation"
4. **Be encouraging**: "Almost there!" not "Failed"

### Examples

❌ **Bad**:
```
Error: Invalid input
Validation failed
You must enter a valid email
```

✅ **Good**:
```
Hmm, that email doesn't look quite right
Let's try that again
Please enter an email like: user@example.com
```

## Database Changes

When modifying the database:

1. Create a Prisma migration
2. Test migration up AND down
3. Consider existing user data
4. Document breaking changes
5. Provide migration guide if needed

## Performance Requirements

Remember these targets:

- API responses: < 300ms
- Page loads: < 1.5 seconds
- Database queries: optimized and indexed
- Background jobs: non-blocking

If your change impacts performance, include benchmarks.

## Accessibility Requirements

All changes must maintain:

- WCAG 2.1 AAA compliance
- Screen reader compatibility
- Keyboard navigation
- Reduced motion support
- High contrast themes

Test with accessibility tools before submitting.

## Questions?

Not sure about something? Ask! Options:

- Open a discussion on GitHub
- Comment on relevant issue
- Reach out to maintainers

We're here to help. Remember: there are no "dumb" questions!

## Recognition

Contributors will be:

- Added to CONTRIBUTORS.md
- Credited in release notes
- Celebrated in our community

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for helping make this tool better for the ADHD community!** 🌟

Remember: Progress over perfection. Every contribution matters. You've got this! 💪
