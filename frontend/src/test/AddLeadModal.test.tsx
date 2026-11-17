import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import {
  AddLeadModal,
  validateCompanyName,
  validateContactPersonName,
  validatePhoneNumber,
  validateEmailAddress,
  validateCountry,
  validateCity,
  validateEstimatedValue,
  validateNextFollowUp,
} from '../features/sales/components/AddLeadModal';

describe('AddLeadModal Validation Functions', () => {
  describe('validateCompanyName', () => {
    it('accepts valid company names containing letters', () => {
      expect(validateCompanyName('Acme Pvt Ltd')).toBe('');
      expect(validateCompanyName('3M Technologies')).toBe('');
      expect(validateCompanyName('Kalpanaaa & Co.')).toBe('');
      expect(validateCompanyName('AT&T')).toBe('');
    });

    it('rejects empty or whitespace-only company name', () => {
      expect(validateCompanyName('')).toBe('Company name is required');
      expect(validateCompanyName('   ')).toBe('Company name is required');
    });

    it('rejects purely numeric or special character company names without letters', () => {
      expect(validateCompanyName('123456')).toBe('Enter a valid company name containing letters.');
      expect(validateCompanyName('!@#$%')).toBe('Enter a valid company name containing letters.');
    });
  });

  describe('validateContactPersonName', () => {
    it('accepts valid names including unicode, spaces, hyphens, periods, apostrophes', () => {
      expect(validateContactPersonName('Rajesh Kumar')).toBe('');
      expect(validateContactPersonName('Shruti Sanjana')).toBe('');
      expect(validateContactPersonName('A. Kumar')).toBe('');
      expect(validateContactPersonName('Mary-Jane')).toBe('');
      expect(validateContactPersonName("O'Connor")).toBe('');
    });

    it('rejects empty name with required message', () => {
      expect(validateContactPersonName('')).toBe('Contact name is required');
      expect(validateContactPersonName('   ')).toBe('Contact name is required');
    });

    it('rejects names containing numbers or invalid characters', () => {
      const expectedError = 'Enter a valid contact person name.';
      expect(validateContactPersonName('23fvghbj')).toBe(expectedError);
      expect(validateContactPersonName('Rajesh123')).toBe(expectedError);
      expect(validateContactPersonName('123456')).toBe(expectedError);
      expect(validateContactPersonName('987 Kumar')).toBe(expectedError);
      expect(validateContactPersonName('@Rajesh')).toBe(expectedError);
      expect(validateContactPersonName('Kumar#123')).toBe(expectedError);
    });
  });

  describe('validateCountry and validateCity', () => {
    it('validates required text', () => {
      expect(validateCountry('India')).toBe('');
      expect(validateCountry('')).toBe('Country is required');
      expect(validateCountry('   ')).toBe('Country is required');

      expect(validateCity('Bangalore')).toBe('');
      expect(validateCity('')).toBe('City is required');
      expect(validateCity('   ')).toBe('City is required');
    });
  });

  describe('validateEstimatedValue', () => {
    it('accepts valid numeric values and empty string', () => {
      expect(validateEstimatedValue('')).toBe('');
      expect(validateEstimatedValue('1200000')).toBe('');
      expect(validateEstimatedValue('500.50')).toBe('');
    });

    it('rejects non-numeric characters and negative numbers', () => {
      expect(validateEstimatedValue('abc')).toBe('Enter a valid non-negative number.');
      expect(validateEstimatedValue('-500')).toBe('Enter a valid non-negative number.');
    });
  });

  describe('validateNextFollowUp', () => {
    it('accepts valid YYYY-MM-DD date and empty string', () => {
      expect(validateNextFollowUp('')).toBe('');
      expect(validateNextFollowUp('2026-11-20')).toBe('');
    });

    it('rejects invalid date format', () => {
      expect(validateNextFollowUp('invalid-date')).toBe('Enter a valid date.');
    });
  });

  describe('validatePhoneNumber', () => {
    it('accepts valid 10-digit Indian mobile numbers starting with 6, 7, 8, 9', () => {
      expect(validatePhoneNumber('9876543210')).toBe('');
      expect(validatePhoneNumber('9123456789')).toBe('');
      expect(validatePhoneNumber('8765432109')).toBe('');
      expect(validatePhoneNumber('7000000000')).toBe('');
      expect(validatePhoneNumber('6999999999')).toBe('');
    });

    it('rejects empty input with required message', () => {
      expect(validatePhoneNumber('')).toBe('Phone number is required');
      expect(validatePhoneNumber('   ')).toBe('Phone number is required');
    });

    it('rejects numbers starting with digits 1-5', () => {
      expect(validatePhoneNumber('1234567890')).toBe('Enter a valid 10-digit Indian mobile number.');
      expect(validatePhoneNumber('2234567890')).toBe('Enter a valid 10-digit Indian mobile number.');
      expect(validatePhoneNumber('5234567890')).toBe('Enter a valid 10-digit Indian mobile number.');
    });

    it('rejects numbers shorter than 10 digits', () => {
      expect(validatePhoneNumber('987654321')).toBe('Enter a valid 10-digit Indian mobile number.');
      expect(validatePhoneNumber('98765')).toBe('Enter a valid 10-digit Indian mobile number.');
    });

    it('rejects numbers longer than 10 digits', () => {
      expect(validatePhoneNumber('98765432101')).toBe('Enter a valid 10-digit Indian mobile number.');
    });

    it('rejects country codes like +91', () => {
      expect(validatePhoneNumber('+919876543210')).toBe('Enter a valid 10-digit Indian mobile number.');
      expect(validatePhoneNumber('+91')).toBe('Enter a valid 10-digit Indian mobile number.');
    });

    it('rejects letters and special characters', () => {
      expect(validatePhoneNumber('98ABC43210')).toBe('Enter a valid 10-digit Indian mobile number.');
      expect(validatePhoneNumber('98765-43210')).toBe('Enter a valid 10-digit Indian mobile number.');
      expect(validatePhoneNumber('98765 43210')).toBe('Enter a valid 10-digit Indian mobile number.');
    });
  });

  describe('validateEmailAddress', () => {
    it('accepts valid Gmail, Yahoo, professional, and unfamiliar valid domains like oo.in', () => {
      expect(validateEmailAddress('shruti@gmail.com')).toBe('');
      expect(validateEmailAddress('shruti@yahoo.com')).toBe('');
      expect(validateEmailAddress('shrutisahoo@gmail.com')).toBe('');
      expect(validateEmailAddress('user@gmail.com')).toBe('');
      expect(validateEmailAddress('employee@company.in')).toBe('');
      expect(validateEmailAddress('contact@kalpanaaa.com')).toBe('');
      expect(validateEmailAddress('first.last@yahoo.com')).toBe('');
      expect(validateEmailAddress('shruti@oo.in')).toBe('');
      expect(validateEmailAddress('dev.lead+test@startup.io')).toBe('');
    });

    it('shows typo warning "Did you mean gmail.com?" for common Gmail domain typos', () => {
      expect(validateEmailAddress('shruti@gmil.com')).toBe('Did you mean gmail.com?');
      expect(validateEmailAddress('shruti@gmial.com')).toBe('Did you mean gmail.com?');
      expect(validateEmailAddress('shruti@gmai.com')).toBe('Did you mean gmail.com?');
      expect(validateEmailAddress('shruti@gmail.con')).toBe('Did you mean gmail.com?');
      expect(validateEmailAddress('shrutisahoo@gil.com')).toBe('Did you mean gmail.com?');
      expect(validateEmailAddress('user@hotmial.com')).toBe('Did you mean hotmail.com?');
      expect(validateEmailAddress('user@yaho.com')).toBe('Did you mean yahoo.com?');
    });

    it('rejects empty input with required message', () => {
      expect(validateEmailAddress('')).toBe('Email address is required');
      expect(validateEmailAddress('   ')).toBe('Email address is required');
    });

    it('rejects emails without @ symbol or with spaces', () => {
      expect(validateEmailAddress('usergmail.com')).toBe('Enter a valid email address.');
      expect(validateEmailAddress('shruti gmail.com')).toBe('Enter a valid email address.');
      expect(validateEmailAddress('user name@gmail.com')).toBe('Enter a valid email address.');
    });

    it('rejects emails with multiple @ symbols', () => {
      expect(validateEmailAddress('shruti@@gmail.com')).toBe('Enter a valid email address.');
      expect(validateEmailAddress('user@@gmail.com')).toBe('Enter a valid email address.');
    });

    it('rejects incomplete emails missing domain or username', () => {
      expect(validateEmailAddress('user@')).toBe('Enter a valid email address.');
      expect(validateEmailAddress('@gmail.com')).toBe('Enter a valid email address.');
    });

    it('rejects emails missing top-level domain extension', () => {
      expect(validateEmailAddress('shruti@gmail')).toBe('Enter a valid email address.');
      expect(validateEmailAddress('user@gmail')).toBe('Enter a valid email address.');
    });

    it('rejects emails containing spaces', () => {
      expect(validateEmailAddress('user name@gmail.com')).toBe('Enter a valid email address.');
    });

    it('rejects emails with consecutive dots in local part or domain', () => {
      expect(validateEmailAddress('user..name@gmail.com')).toBe('Enter a valid email address.');
      expect(validateEmailAddress('user@company..com')).toBe('Enter a valid email address.');
    });

    it('rejects domain labels with leading or trailing hyphens', () => {
      expect(validateEmailAddress('user@-company.com')).toBe('Enter a valid email address.');
      expect(validateEmailAddress('user@company-.com')).toBe('Enter a valid email address.');
    });
  });
});

describe('AddLeadModal Component UI and Interaction', () => {
  it('renders modal when open and does not render when closed', () => {
    const { rerender } = render(
      <AddLeadModal isOpen={false} onClose={vi.fn()} onSubmit={vi.fn()} />
    );
    expect(screen.queryByText('Add New Lead')).not.toBeInTheDocument();

    rerender(<AddLeadModal isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.getByText('Add New Lead')).toBeInTheDocument();
  });

  it('validates required fields on empty submit without calling onSubmit', async () => {
    const onSubmit = vi.fn();
    render(<AddLeadModal isOpen={true} onClose={vi.fn()} onSubmit={onSubmit} />);

    const submitBtn = screen.getByRole('button', { name: /create lead/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(screen.getByText('Company name is required')).toBeInTheDocument();
    expect(screen.getByText('Contact name is required')).toBeInTheDocument();
    expect(screen.getByText('Email address is required')).toBeInTheDocument();
    expect(screen.getByText('Phone number is required')).toBeInTheDocument();
    expect(screen.getByText('City is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('validates invalid contact person name while typing and on submit, preventing API call', async () => {
    const onSubmit = vi.fn();
    render(<AddLeadModal isOpen={true} onClose={vi.fn()} onSubmit={onSubmit} />);

    const nameInput = screen.getByPlaceholderText('e.g. Rajesh Kumar');

    // Type 23fvghbj (contains numbers)
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: '23fvghbj' } });
    });

    expect(
      screen.getByText('Enter a valid contact person name.')
    ).toBeInTheDocument();

    // Fill valid company, email, phone, city but keep invalid name
    fireEvent.change(screen.getByPlaceholderText('Enter company name'), { target: { value: 'Acme Corp' } });
    fireEvent.change(screen.getByPlaceholderText('Enter email address'), { target: { value: 'user@gmail.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter 10-digit mobile number'), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByPlaceholderText('Enter city'), { target: { value: 'Mumbai' } });

    const submitBtn = screen.getByRole('button', { name: /create lead/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText('Enter a valid contact person name.')
    ).toBeInTheDocument();

    // Correct to valid name Rajesh Kumar
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Rajesh Kumar' } });
    });

    expect(
      screen.queryByText('Enter a valid contact person name.')
    ).not.toBeInTheDocument();

    // Submit now succeeds
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        contactName: 'Rajesh Kumar',
      })
    );
  });

  it('validates invalid phone number on blur and clears on correction', async () => {
    render(<AddLeadModal isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} />);

    const phoneInput = screen.getByPlaceholderText('Enter 10-digit mobile number');

    // Enter invalid phone (starts with 1) and blur
    await act(async () => {
      fireEvent.change(phoneInput, { target: { value: '1234567890' } });
      fireEvent.blur(phoneInput);
    });

    expect(screen.getByText('Enter a valid 10-digit Indian mobile number.')).toBeInTheDocument();

    // Correct to valid Indian number (starts with 9)
    await act(async () => {
      fireEvent.change(phoneInput, { target: { value: '9876543210' } });
    });

    expect(screen.queryByText('Enter a valid 10-digit Indian mobile number.')).not.toBeInTheDocument();
  });

  it('validates invalid email format on blur and clears on correction', async () => {
    render(<AddLeadModal isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} />);

    const emailInput = screen.getByPlaceholderText('Enter email address');

    // Enter invalid email and blur
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'usergmail.com' } });
      fireEvent.blur(emailInput);
    });

    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();

    // Correct to valid professional email
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'contact@kalpanaaa.com' } });
    });

    expect(screen.queryByText('Enter a valid email address.')).not.toBeInTheDocument();
  });

  it('prevents typing non-digit characters into phone input', async () => {
    render(<AddLeadModal isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} />);

    const phoneInput = screen.getByPlaceholderText('Enter 10-digit mobile number');

    const preventedA = fireEvent.keyDown(phoneInput, { key: 'a' });
    expect(preventedA).toBe(false);

    const allowedDigit = fireEvent.keyDown(phoneInput, { key: '9' });
    expect(allowedDigit).toBe(true);

    const allowedBackspace = fireEvent.keyDown(phoneInput, { key: 'Backspace' });
    expect(allowedBackspace).toBe(true);
  });

  it('submits successfully when all fields are valid and resets state', async () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();

    render(<AddLeadModal isOpen={true} onClose={onClose} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByPlaceholderText('Enter company name'), {
      target: { value: 'Kalpanaaa Technologies' },
    });
    fireEvent.change(screen.getByPlaceholderText('e.g. Rajesh Kumar'), {
      target: { value: 'Rajesh Kumar' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter email address'), {
      target: { value: 'contact@kalpanaaa.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter 10-digit mobile number'), {
      target: { value: '9876543210' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter city'), {
      target: { value: 'Bangalore' },
    });

    const submitBtn = screen.getByRole('button', { name: /create lead/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        company: 'Kalpanaaa Technologies',
        contactName: 'Rajesh Kumar',
        email: 'contact@kalpanaaa.com',
        phone: '9876543210',
      })
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows typo warning "Did you mean gmail.com?" for shruti@gmil.com and blocks save', async () => {
    const onSubmit = vi.fn();
    render(<AddLeadModal isOpen={true} onClose={vi.fn()} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByPlaceholderText('Enter company name'), { target: { value: 'Acme Corp' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. Rajesh Kumar'), { target: { value: 'Shruti Sahoo' } });
    fireEvent.change(screen.getByPlaceholderText('Enter 10-digit mobile number'), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByPlaceholderText('Enter city'), { target: { value: 'Bhubaneswar' } });

    const emailInput = screen.getByPlaceholderText('Enter email address');
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'shruti@gmil.com' } });
      fireEvent.blur(emailInput);
    });

    expect(screen.getByText('Did you mean gmail.com?')).toBeInTheDocument();
    expect(screen.getByText(/Yes, use shruti@gmail.com/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /create lead/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    // Blocked from submitting
    expect(onSubmit).not.toHaveBeenCalled();

    // Click suggestion
    const suggestionBtn = screen.getByRole('button', { name: /Yes, use shruti@gmail.com/i });
    await act(async () => {
      fireEvent.click(suggestionBtn);
    });

    expect((emailInput as HTMLInputElement).value).toBe('shruti@gmail.com');
    expect(screen.queryByText('Did you mean gmail.com?')).not.toBeInTheDocument();

    // Now submit works
    await act(async () => {
      fireEvent.click(submitBtn);
    });
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'shruti@gmail.com',
      })
    );
  });
});
