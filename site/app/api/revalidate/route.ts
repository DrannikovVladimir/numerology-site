import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// POST /api/revalidate?secret=...&path=/chislo-sudby/7/
//
// Сбрасывает ISR-кеш конкретного URL. Используется после ручного
// обновления уже опубликованной статьи (добавили картинку, раздел и т.п.) —
// без этого изменения на файле не появятся на сайте до истечения
// текущего окна revalidate (см. docs/ARCHITECTURE.md, раздел про ISR).
//
// Требует REVALIDATE_SECRET в .env на сервере — без него любой мог бы
// сбрасывать кеш произвольных страниц.

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const path = request.nextUrl.searchParams.get("path");

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Неверный secret" }, { status: 401 });
  }

  if (!path) {
    return NextResponse.json({ message: "Не передан параметр path" }, { status: 400 });
  }

  revalidatePath(path);

  return NextResponse.json({ revalidated: true, path, now: Date.now() });
}