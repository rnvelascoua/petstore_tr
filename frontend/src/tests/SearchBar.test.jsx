import { fireEvent, render, screen } from '@testing-library/react';
import SearchBar from '../components/catalog/SearchBar';

describe('SearchBar', () => {
  it('renders input with aria-label', () => {
    render(<SearchBar value="" onChange={() => {}} onClear={() => {}} />);
    expect(screen.getByLabelText('Search pets')).toBeInTheDocument();
  });

  it('shows clear button only when value is non-empty', () => {
    const { rerender } = render(<SearchBar value="" onChange={() => {}} onClear={() => {}} />);
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();

    rerender(<SearchBar value="golden" onChange={() => {}} onClear={() => {}} />);
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('calls onChange on input', () => {
    const onChange = jest.fn();
    render(<SearchBar value="" onChange={onChange} onClear={() => {}} />);

    fireEvent.change(screen.getByLabelText('Search pets'), { target: { value: 'dog' } });
    expect(onChange).toHaveBeenCalledWith('dog');
  });

  it('enforces maxLength 100', () => {
    render(<SearchBar value="" onChange={() => {}} onClear={() => {}} />);
    const input = screen.getByLabelText('Search pets');
    expect(input).toHaveAttribute('maxlength', '100');
  });
});
