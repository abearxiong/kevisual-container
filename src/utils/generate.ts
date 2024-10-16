import { customAlphabet } from 'nanoid';
const alphabetNumber = '0123456789';
const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const generateCodeUrl = customAlphabet(alphabet + alphabetNumber, 8);

export const generateId = () => {
  return 'g-' + generateCodeUrl(8);
};
