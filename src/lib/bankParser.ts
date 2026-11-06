export interface TransactionItem {
  date: string;
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
}

export const TRANSACTION_CATEGORIES = [
  "Ocio",
  "Restaurantes",
  "Supermercado",
  "Transporte",
  "Compras",
  "Pagos",
  "Vivienda/Gastos Comunes",
  "Viajes",
  "Salud",
  "Otros",
] as const;

export function assignAutoCategory(description: string): string {
  const normalizedDescription = description
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const categoryKeywords: Array<[string, string[]]> = [
    [
      "Viajes",
      [
        "AIR CANADA",
        "LATAM",
        "SKY",
        "HOTEL",
        "BOOKING",
        "AIRBNB",
        "IMMIGRATION",
      ],
    ],
    [
      "Vivienda/Gastos Comunes",
      [
        "ARRIENDO",
        "GASTO COMUN",
        "LIPIAPP",
        "ENEL",
        "CHILQUINTA",
        "ESVAL",
        "AGUAS",
      ],
    ],
    [
      "Salud",
      [
        "AHUMADA",
        "CRUZ VERDE",
        "SALCOBRAND",
        "DOCTOR",
        "CLINICA",
        "PUNTO DE ALIVIO",
      ],
    ],
    ["Ocio", ["Cinemark", "Ticketmaster", "Steam", "Juegos"]],
    [
      "Restaurantes",
      ["Uber Eats", "KFC", "McDonald", "Coffee", "Dulceria", "Sandoz", "Rocket"],
    ],
    ["Supermercado", ["Jumbo", "Santa Isabel", "Lider", "Hiper"]],
    [
      "Transporte",
      ["Uber", "Didi", "Copec", "Efe_Valpo", "Pasajebus", "Autopista"],
    ],
    ["Pagos", ["Monto Cancelado", "Traspaso"]],
    [
      "Compras",
      [
        "Falabella",
        "Ali-express",
        "Shein",
        "Mercadopago",
        "Casa Ideas",
        "Sodimac",
        "Easy",
      ],
    ],
  ];

  for (const [category, keywords] of categoryKeywords) {
    if (
      keywords.some((keyword) =>
        normalizedDescription.includes(
          keyword
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase(),
        ),
      )
    ) {
      return category;
    }
  }

  return "Otros";
}

function splitCSVLine(line: string, delimiter: string): string[] {
  const fields: string[] = [];
  let field = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      if (insideQuotes && line[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (character === delimiter && !insideQuotes) {
      fields.push(field.trim());
      field = "";
    } else {
      field += character;
    }
  }

  fields.push(field.trim());
  return fields;
}

function detectDelimiter(line: string): string {
  const delimiters = [",", ";", "\t"];
  let selectedDelimiter = ",";
  let highestCount = -1;

  for (const delimiter of delimiters) {
    const count = splitCSVLine(line, delimiter).length - 1;
    if (count > highestCount) {
      selectedDelimiter = delimiter;
      highestCount = count;
    }
  }

  return selectedDelimiter;
}

function normalizeHeader(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

function parseDate(value: string): string | null {
  const date = value.trim();
  let year: number;
  let month: number;
  let day: number;

  const yearFirst = date.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (yearFirst) {
    year = Number(yearFirst[1]);
    month = Number(yearFirst[2]);
    day = Number(yearFirst[3]);
  } else {
    const dayFirst = date.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2}|\d{4})$/);
    if (!dayFirst) return null;

    day = Number(dayFirst[1]);
    month = Number(dayFirst[2]);
    year = Number(dayFirst[3]);
    if (year < 100) year += 2000;
  }

  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return `${year.toString().padStart(4, "0")}-${month
    .toString()
    .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

function parseAmount(value: string): { amount: number; isCredit: boolean } | null {
  let normalized = value.trim();
  const isParenthesized = /^\(.*\)$/.test(normalized);
  const isSantanderCredit = /\$\s*-/.test(normalized);
  const isNegative = isParenthesized || /^-/.test(normalized);
  normalized = normalized.replace(/[()]/g, "").replace(/[^\d,.-]/g, "");

  if (!/\d/.test(normalized)) return null;

  const lastComma = normalized.lastIndexOf(",");
  const lastPeriod = normalized.lastIndexOf(".");
  const decimalSeparator =
    lastComma > lastPeriod ? "," : lastPeriod > lastComma ? "." : null;

  if (decimalSeparator) {
    const separatorIndex = normalized.lastIndexOf(decimalSeparator);
    const decimalDigits = normalized.length - separatorIndex - 1;

    if (decimalDigits === 0 || decimalDigits === 3) {
      normalized = normalized.replace(/[,.]/g, "");
    } else {
      const integerPart = normalized
        .slice(0, separatorIndex)
        .replace(/[,.]/g, "");
      const decimalPart = normalized
        .slice(separatorIndex + 1)
        .replace(/[,.]/g, "");
      normalized = `${integerPart}.${decimalPart}`;
    }
  }

  const amount = Number(normalized);
  if (!Number.isFinite(amount)) return null;

  return {
    amount: Math.abs(amount),
    isCredit: isSantanderCredit || !isNegative,
  };
}

function findColumn(headers: string[], pattern: RegExp): number {
  return headers.findIndex((header) => pattern.test(normalizeHeader(header)));
}

export function parseBankCSV(csvText: string): TransactionItem[] {
  const lines = csvText
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const delimiter = detectDelimiter(lines[0]);
  const firstRow = splitCSVLine(lines[0], delimiter);
  const dateColumn = findColumn(firstRow, /^(fecha|date)$/);
  const descriptionColumn = findColumn(
    firstRow,
    /^(descripcion|description|concepto|detalle|glosa|movimiento)$/,
  );
  const amountColumn = findColumn(
    firstRow,
    /^(monto|amount|valor|importe|total|saldo|cargo|abono|debito|credito)$/,
  );
  const hasHeader = dateColumn >= 0 && amountColumn >= 0;
  const columns = hasHeader
    ? {
        date: dateColumn,
        description: descriptionColumn >= 0 ? descriptionColumn : 1,
        amount: amountColumn,
        amountHeader: normalizeHeader(firstRow[amountColumn]),
      }
    : { date: 0, description: 1, amount: 2, amountHeader: "" };
  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines.flatMap((line): TransactionItem[] => {
    const fields = splitCSVLine(line, delimiter);
    const date = parseDate(fields[columns.date] ?? "");
    const description = (fields[columns.description] ?? "").trim();
    const parsedAmount = parseAmount(fields[columns.amount] ?? "");

    if (!date || !description || !parsedAmount) return [];

    const isIncomeColumn = /^(abono|credito)$/.test(columns.amountHeader);
    const isExpenseColumn = /^(cargo|debito)$/.test(columns.amountHeader);

    return [
      {
        date,
        description,
        amount: parsedAmount.amount,
        type:
          isIncomeColumn || (!isExpenseColumn && parsedAmount.isCredit)
            ? "INCOME"
            : "EXPENSE",
        category: assignAutoCategory(description),
      },
    ];
  });
}

function parseSantanderShortDate(value: string): string | null {
  const [day, month, inputYear] = value.split("/");
  const year = inputYear.length === 2 ? 2000 + Number(inputYear) : Number(inputYear);
  return parseDate(`${year}-${month}-${day}`);
}

function getCurrentPeriodRange(
  sectionText: string,
): { start: string; end: string } | null {
  const date = String.raw`\d{2}\/\d{2}\/\d{2}`;
  const rangePattern = new RegExp(
    String.raw`(?:desde|del)\s*(${date})\s*(?:al|hasta|a|[-–—])\s*(${date})|(${date})\s*(?:al|hasta|a|[-–—])\s*(${date})`,
    "i",
  );
  const firstAmount = sectionText.indexOf("$");
  const sectionHeader =
    firstAmount === -1
      ? sectionText
      : sectionText.slice(0, firstAmount);
  const rangeMatch = rangePattern.exec(sectionHeader);

  if (!rangeMatch) return null;

  const startDate = rangeMatch[1] ?? rangeMatch[3];
  const endDate = rangeMatch[2] ?? rangeMatch[4];
  const start = parseSantanderShortDate(startDate);
  const end = parseSantanderShortDate(endDate);

  if (!start || !end) return null;

  return { start, end };
}

export function parseSantanderPDFText(text: string): TransactionItem[] {
  const startPattern = /2\s*\.\s*PER[IÍ]ODO\s+ACTUAL/i;
  const endPattern =
    /3\s*\.\s*CARGOS\s*,?\s*COMISIONES|III\s*\.\s*INFORMACI[ÓO]N\s+DE\s+PAGO/i;
  const sectionStart = startPattern.exec(text);

  if (!sectionStart || sectionStart.index === undefined) return [];

  const contentStart = sectionStart.index + sectionStart[0].length;
  const remainingText = text.slice(contentStart);
  const sectionEnd = endPattern.exec(remainingText);
  const sectionText = sectionEnd
    ? remainingText.slice(0, sectionEnd.index)
    : remainingText;
  const periodRange = getCurrentPeriodRange(sectionText);
  const transactions: TransactionItem[] = [];
  const knownCities =
    /^(?:(?:SANTIAGO|LAS\s+CONDES|PROVIDENCIA|QUILPUE|VI[NÑ]A\s+DEL\s+MAR|VALPARA[IÍ]SO|NUNOA|ÑUÑOA|MARGA\s+MARGA|CONCON|SINGAPORE|LUXEMBOURG)\s+)+/i;

  for (const rawLine of sectionText.split(/\r?\n/)) {
    const line = rawLine.replace(/\s+/g, " ").trim();
    if (
      !line ||
      /TOTAL\s+OPERACIONES|MOVIMIENTOS\s+TARJETA|PAGAR\s+HASTA/i.test(line)
    ) {
      continue;
    }

    const dateMatch = /(\d{2}\/\d{2}\/(?:\d{2}|\d{4}))/.exec(line);
    const amountMatch = /\$\s*([-−]?)\s*([\d.,]+)/.exec(line);
    if (!dateMatch || !amountMatch || amountMatch.index <= dateMatch.index) {
      continue;
    }

    const date = parseSantanderShortDate(dateMatch[1]);
    const parsedAmount = parseAmount(
      `${amountMatch[1] ? "-" : ""}${amountMatch[2]}`,
    );
    if (!date || !parsedAmount || parsedAmount.amount === 0) continue;

    if (
      periodRange &&
      (periodRange.start <= periodRange.end
        ? date < periodRange.start || date > periodRange.end
        : date < periodRange.start && date > periodRange.end)
    ) {
      continue;
    }

    const description = line
      .slice(dateMatch.index + dateMatch[0].length, amountMatch.index)
      .replace(/^[\s|;,:-]+|[\s|;,:-]+$/g, "")
      .replace(knownCities, "")
      .trim();

    if (!description) continue;

    const isIncome =
      /MONTO\s+CANCELADO|TRASPASO\s+MISMO\s+TITULAR/i.test(description) ||
      Boolean(amountMatch[1]);

    transactions.push({
      date,
      description,
      amount: parsedAmount.amount,
      type: isIncome ? "INCOME" : "EXPENSE",
      category: assignAutoCategory(description),
    });
  }

  return transactions;
}

interface PositionedTextItem {
  text: string;
  x: number;
  y: number;
}

function reconstructPageLines(
  items: unknown[],
): string[] {
  const positionedItems: PositionedTextItem[] = items.flatMap((item) => {
    if (
      typeof item !== "object" ||
      item === null ||
      !("str" in item) ||
      !("transform" in item) ||
      typeof item.str !== "string" ||
      !Array.isArray(item.transform)
    ) {
      return [];
    }

    const x = item.transform[4];
    const y = item.transform[5];
    if (!Number.isFinite(x) || !Number.isFinite(y)) return [];

    return [{ text: item.str, x, y }];
  });

  positionedItems.sort((left, right) => right.y - left.y || left.x - right.x);

  const lines: Array<{ y: number; items: PositionedTextItem[] }> = [];
  for (const item of positionedItems) {
    const line = lines.find((candidate) => Math.abs(candidate.y - item.y) <= 2);
    if (line) {
      line.items.push(item);
    } else {
      lines.push({ y: item.y, items: [item] });
    }
  }

  return lines.map((line) =>
    line.items
      .sort((left, right) => left.x - right.x)
      .map((item) => item.text.trim())
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

export async function parseSantanderPDF(
  data: Uint8Array,
): Promise<TransactionItem[]> {
  const pdfjsLib = await import("pdfjs-dist");

  if (
    typeof window !== "undefined" &&
    !pdfjsLib.GlobalWorkerOptions.workerSrc
  ) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  }

  const loadingTask = pdfjsLib.getDocument({ data });

  try {
    const pdf = await loadingTask.promise;
    const pageLines: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      pageLines.push(...reconstructPageLines(content.items));
    }

    return parseSantanderPDFText(pageLines.join("\n"));
  } finally {
    await loadingTask.destroy();
  }
}
