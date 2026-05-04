import { fireEvent, render, screen } from '@testing-library/react';
import CategoryFilter from '../components/catalog/CategoryFilter';

describe('CategoryFilter', () => {
  it('renders all options', () => {
    render(<CategoryFilter value="" onChange={() => {}} />);
    ['All', 'Cats', 'Dogs', 'Fish', 'Birds'].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('fires onChange with selected value', () => {
    const onChange = jest.fn();
    render(<CategoryFilter value="" onChange={onChange} />);

    fireEvent.click(screen.getByText('Dogs'));
    expect(onChange).toHaveBeenCalledWith('DOGS');
  });
});
