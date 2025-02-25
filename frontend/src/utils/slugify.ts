export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')                   // Normaliza caracteres especiales
    .replace(/[\u0300-\u036f]/g, '')   // Elimina diacríticos
    .toLowerCase()                      // Convierte a minúsculas
    .trim()                            // Elimina espacios al inicio y final
    .replace(/\s+/g, '-')              // Reemplaza espacios con guiones
    .replace(/[^\w-]+/g, '')           // Elimina caracteres no permitidos
    .replace(/--+/g, '-')              // Reemplaza múltiples guiones con uno solo
    .replace(/^-+/, '')                // Elimina guiones al inicio
    .replace(/-+$/, '');               // Elimina guiones al final
}

export function generateUniqueSlug(title: string, existingSlugs: string[]): string {
  let slug = slugify(title);
  let uniqueSlug = slug;
  let counter = 1;

  while (existingSlugs.includes(uniqueSlug)) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
}
