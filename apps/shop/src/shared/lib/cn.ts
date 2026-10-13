type ClassValue = string | false | null | undefined | 0;
export const cn = (...cls: ClassValue[]) => cls.filter(Boolean).join(' ');
