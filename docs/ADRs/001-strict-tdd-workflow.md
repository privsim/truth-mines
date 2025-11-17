# ADR 001: Strict Test-Driven Development Workflow

**Status:** Accepted
**Date:** 2025-11-17
**Deciders:** Project Team
**Related Issues:** Foundation for all development issues

## Context

The Truth Mines project aims to create a reliable, maintainable formal knowledge system that will grow over time. The codebase spans multiple languages (Rust, TypeScript, Python) and involves complex graph algorithms, 3D visualization, and data integrity requirements. We need a development methodology that ensures:

1. **Correctness** - Graph operations, layout algorithms, and data transformations must be correct
2. **Regression Prevention** - Changes should not break existing functionality
3. **Documentation** - Tests serve as executable specifications
4. **Refactoring Confidence** - Ability to improve code without fear
5. **Specification Clarity** - Clear definition of what "done" means

Traditional "write code first, test later" approaches often result in:
- Incomplete test coverage
- Tests written to match implementation rather than specification
- Missing edge cases
- Difficult-to-test architectures

## Decision

We will adopt **strict Test-Driven Development (TDD)** as the mandatory development methodology for all production code in the Truth Mines project.

### Core Principles

1. **Red-Green-Refactor Cycle**
   - Write a failing test first (Red)
   - Write minimal code to make it pass (Green)
   - Refactor while keeping tests green (Refactor)

2. **No Production Code Without Tests**
   - Every function, method, or module must have at least one test written **before** implementation
   - Exceptions: Only trivial getters/setters, generated code, or one-line delegators

3. **Coverage Requirements**
   - **Rust:** Minimum 95% code coverage (enforced in CI)
   - **TypeScript/React:** Minimum 80% code coverage (enforced in CI)
   - **Python:** Minimum 90% code coverage (enforced in CI)

4. **Test Organization**

   **Rust:**
   ```rust
   // Unit tests colocated with modules
   #[cfg(test)]
   mod tests {
       use super::*;

       #[test]
       fn test_graph_store_add_node_success() {
           // Arrange
           let mut store = GraphStore::new();
           let node = create_test_node("test123");

           // Act
           store.add_node(node.clone());

           // Assert
           assert_eq!(store.get_node("test123"), Some(&node));
       }
   }
   ```

   Integration tests in `tests/` directory

   **TypeScript:**
   ```typescript
   // Component.test.tsx colocated with Component.tsx
   describe('Graph2D', () => {
     it('should render canvas element', () => {
       render(<Graph2D nodes={[]} edges={[]} />);
       expect(screen.getByRole('img')).toBeInTheDocument();
     });
   });
   ```

   **Python:**
   ```python
   # test_validate.py
   def test_validate_accepts_valid_graph():
       # Arrange
       nodes_dir = create_valid_nodes_fixture()

       # Act
       result = validate_graph(nodes_dir)

       # Assert
       assert result.is_valid
       assert len(result.errors) == 0
   ```

5. **Test Naming Convention**
   - Format: `test_<functionality>_<condition>_<expected_outcome>`
   - Example: `test_find_paths_no_path_exists_returns_empty()`
   - Makes test purpose immediately clear

6. **Test Categories**
   - **Unit Tests** - Test individual functions/methods in isolation
   - **Integration Tests** - Test component interactions
   - **End-to-End Tests** - Test complete user workflows
   - **Property Tests** - Test invariants (future: using quickcheck/proptest)

### Enforcement Mechanisms

1. **CI Pipeline**
   - All tests must pass before merge
   - Coverage reports generated and checked
   - Failed coverage check blocks PR merge

2. **Code Review**
   - Reviewers must verify tests written before implementation
   - PRs without tests are automatically rejected
   - Test quality is part of review criteria

3. **GitHub Issue Templates**
   - Every issue includes "Test Plan" section
   - Test plan must be completed before issue marked "Done"

4. **Pre-commit Hooks** (Optional)
   - Run tests before allowing commit
   - Ensure no broken tests committed

## Consequences

### Positive

1. **High Confidence in Correctness**
   - Graph algorithms proven correct through comprehensive tests
   - Edge cases caught early in development

2. **Living Documentation**
   - Tests demonstrate how to use each component
   - New developers can learn API from tests

3. **Fearless Refactoring**
   - Can improve code structure without breaking functionality
   - Tests catch regressions immediately

4. **Better API Design**
   - Writing tests first forces thinking about usability
   - Hard-to-test code is usually poorly designed

5. **Faster Debugging**
   - When bugs occur, tests can be added to reproduce
   - Fix verified by test passing

6. **Reduced Technical Debt**
   - Less untested code accumulating
   - Continuous quality maintenance

### Negative

1. **Initial Development Slower**
   - Writing tests first takes more time upfront
   - Learning curve for developers new to TDD

2. **Test Maintenance Overhead**
   - Tests need updating when requirements change
   - Large test suites can become burden

3. **Discipline Required**
   - Easy to slip into "code first" habits under pressure
   - Requires team commitment and code review vigilance

4. **Not All Code Equally Testable**
   - UI interactions and 3D rendering harder to test
   - May need creative testing approaches (visual regression, etc.)

### Mitigations

1. **Invest in Testing Infrastructure**
   - Good test utilities and fixtures
   - Fast test execution (parallel, incremental)
   - Clear test output and failure messages

2. **Accept Different Testing Approaches**
   - UI: Visual regression tests, snapshot tests
   - WASM: Integration tests with JavaScript harness
   - 3D rendering: Frame capture comparison

3. **Continuous Education**
   - Code review feedback on test quality
   - Team knowledge sharing on testing patterns

4. **Pragmatic Exceptions**
   - Spike/prototype code can skip tests
   - Must be clearly marked and not merged to main
   - Production code always requires tests

## Examples

### Example 1: Rust Graph Store

```rust
// 1. Write failing test
#[test]
fn test_graph_store_neighbors_2_hop() {
    let mut store = GraphStore::new();
    // Create A→B→C→D
    store.add_node(create_node("a"));
    store.add_node(create_node("b"));
    store.add_node(create_node("c"));
    store.add_edge(create_edge("a", "b"));
    store.add_edge(create_edge("b", "c"));

    let neighbors = store.neighbors("a", 2);

    assert_eq!(neighbors.len(), 2);
    assert!(neighbors.contains(&"b"));
    assert!(neighbors.contains(&"c"));
}

// 2. Implement (initially fails)
// 3. Make it pass (implement neighbors method)
// 4. Refactor if needed
```

### Example 2: TypeScript Component

```typescript
// 1. Write failing test
test('NodeDetail displays justification tree tab', () => {
  render(<NodeDetail nodeId="test123" />);

  const justificationTab = screen.getByRole('tab', { name: /justification/i });
  expect(justificationTab).toBeInTheDocument();

  userEvent.click(justificationTab);
  expect(screen.getByTestId('justification-tree')).toBeVisible();
});

// 2. Component initially missing tab
// 3. Add tab to component
// 4. Test passes
```

### Example 3: Python Validation

```python
# 1. Write failing test
def test_validate_rejects_invalid_domain():
    node = create_node_with_domain("biology")  # Invalid domain
    nodes_dir = create_temp_dir_with_nodes([node])

    result = validate_graph(nodes_dir, strict=True)

    assert not result.is_valid
    assert "invalid domain" in result.errors[0].lower()

# 2. Validator doesn't check domains yet
# 3. Implement domain validation
# 4. Test passes
```

## References

- "Test Driven Development: By Example" - Kent Beck
- "Growing Object-Oriented Software, Guided by Tests" - Freeman & Pryce
- Rust Testing Guide: https://doc.rust-lang.org/book/ch11-00-testing.html
- React Testing Library: https://testing-library.com/react
- pytest Documentation: https://docs.pytest.org/

## Revision History

- **2025-11-17**: Initial version accepted
