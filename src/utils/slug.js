
export const slug = (text) => {
    return text
        .normalize('NFD') // Normaliza a string para decompor os caracteres acentuados
        .replace(/[\u0300-\u036f]/g, '') // Remove os diacríticos (acentos)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, '-') // Substitui espaços por hífens
        .replace(/-+/g, '-'); // Remove hífens repetidos   // Substitui múltiplos - por um único -
  };
  