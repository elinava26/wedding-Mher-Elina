const MAX_EXTRA_GUEST_ROWS: number = 8;

const EXTRA_GUEST_PLACEHOLDER: string = 'հյուրի անունը';

function createTrashIconSvg(): SVGSVGElement {
  const svg: SVGSVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '20');
  svg.setAttribute('height', '20');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');

  const lid: SVGPathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  lid.setAttribute(
    'd',
    'M9 3.5h6l1.1 2H20v2H4V5.5h3.9L9 3.5z',
  );
  lid.setAttribute('fill', 'none');
  lid.setAttribute('stroke', 'currentColor');
  lid.setAttribute('stroke-width', '1.35');
  lid.setAttribute('stroke-linejoin', 'round');

  const body: SVGPathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  body.setAttribute('d', 'M7 8.5h10l-.9 11H7.9L7 8.5z');
  body.setAttribute('fill', 'none');
  body.setAttribute('stroke', 'currentColor');
  body.setAttribute('stroke-width', '1.35');
  body.setAttribute('stroke-linejoin', 'round');

  const line1: SVGLineElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line1.setAttribute('x1', '10');
  line1.setAttribute('y1', '11');
  line1.setAttribute('x2', '9.5');
  line1.setAttribute('y2', '17');
  line1.setAttribute('stroke', 'currentColor');
  line1.setAttribute('stroke-width', '1.2');
  line1.setAttribute('stroke-linecap', 'round');

  const line2: SVGLineElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line2.setAttribute('x1', '14');
  line2.setAttribute('y1', '11');
  line2.setAttribute('x2', '14.5');
  line2.setAttribute('y2', '17');
  line2.setAttribute('stroke', 'currentColor');
  line2.setAttribute('stroke-width', '1.2');
  line2.setAttribute('stroke-linecap', 'round');

  svg.appendChild(lid);
  svg.appendChild(body);
  svg.appendChild(line1);
  svg.appendChild(line2);
  return svg;
}

function clearExtraGuestRows(form: HTMLFormElement): void {
  const list: HTMLElement | null = form.querySelector('[data-rsvp-guest-list]');
  if (list) {
    list.innerHTML = '';
  }
}

function appendGuestRow(list: HTMLElement): HTMLInputElement | null {
  const count: number = list.querySelectorAll('input[name="ExtraGuest"]').length;
  if (count >= MAX_EXTRA_GUEST_ROWS) {
    return null;
  }

  const row: HTMLDivElement = document.createElement('div');
  row.className = 'rsvp-guests__row';

  const fieldWrap: HTMLDivElement = document.createElement('div');
  fieldWrap.className = 'rsvp-guests__field-wrap';

  const input: HTMLInputElement = document.createElement('input');
  input.type = 'text';
  input.name = 'ExtraGuest';
  input.className = 'rsvp-input rsvp-input--guest-pill';
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('placeholder', EXTRA_GUEST_PLACEHOLDER);

  const removeBtn: HTMLButtonElement = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'rsvp-btn-remove-guest';
  removeBtn.setAttribute('data-rsvp-remove-guest', '');
  removeBtn.setAttribute('aria-label', 'Ջնջել հյուրի դաշտը');
  removeBtn.appendChild(createTrashIconSvg());

  fieldWrap.appendChild(input);
  row.appendChild(fieldWrap);
  row.appendChild(removeBtn);
  list.appendChild(row);

  return input;
}

function initExtraGuestRows(form: HTMLFormElement): void {
  const list: HTMLElement | null = form.querySelector('[data-rsvp-guest-list]');
  const addBtn: HTMLButtonElement | null = form.querySelector('[data-rsvp-add-guest]');
  if (!list || !addBtn) {
    return;
  }

  list.addEventListener('click', (ev: MouseEvent) => {
    const target: HTMLElement | null = ev.target instanceof HTMLElement ? ev.target : null;
    const removeBtn: HTMLElement | null = target?.closest('[data-rsvp-remove-guest]') ?? null;
    if (!removeBtn) {
      return;
    }
    const row: HTMLElement | null = removeBtn.closest('.rsvp-guests__row');
    row?.remove();
  });

  addBtn.addEventListener('click', () => {
    const input: HTMLInputElement | null = appendGuestRow(list);
    input?.focus();
  });
}

interface RsvpPayload {
  Question: string;
  Name: string;
  ExtraGuest: string[];
  Guest: string[];
}

function collectPayload(form: HTMLFormElement): RsvpPayload {
  const fd: FormData = new FormData(form);
  const extraGuest: string[] = [];
  fd.getAll('ExtraGuest').forEach((value: FormDataEntryValue) => {
    const trimmed: string = String(value).trim();
    if (trimmed.length > 0) {
      extraGuest.push(trimmed);
    }
  });
  const guest: string[] = [];
  fd.getAll('Guest').forEach((value: FormDataEntryValue) => {
    guest.push(String(value));
  });
  return {
    Question: String(fd.get('Question') ?? ''),
    Name: String(fd.get('Name') ?? '').trim(),
    ExtraGuest: extraGuest,
    Guest: guest,
  };
}

function validate(form: HTMLFormElement): string | null {
  const nameInput: HTMLInputElement | null = form.querySelector('[name="Name"]');
  if (!nameInput?.value.trim()) {
    return 'Խնդրում ենք լրացնել անունը։';
  }

  const q: HTMLInputElement | null = form.querySelector('input[name="Question"]:checked');
  if (!q) {
    return 'Ընտրեք ներկայության հաստատումը։';
  }

  const guests: NodeListOf<HTMLInputElement> = form.querySelectorAll(
    'input[name="Guest"]:checked',
  );
  if (guests.length === 0) {
    return 'Ընտրեք հրավիրող կողմը։';
  }

  return null;
}

export function initForm(): void {
  const form: HTMLFormElement | null = document.querySelector('[data-rsvp-form]');
  const box: HTMLElement | null = document.querySelector('[data-rsvp-feedback]');

  if (!form || !box) {
    return;
  }

  initExtraGuestRows(form);

  const submitUrl: string | undefined = import.meta.env.VITE_RSVP_SUBMIT_URL;

  form.addEventListener('submit', async (ev: SubmitEvent) => {
    ev.preventDefault();
    box.textContent = '';
    box.hidden = true;

    const err: string | null = validate(form);
    if (err) {
      box.textContent = err;
      box.hidden = false;
      return;
    }

    const payload: RsvpPayload = collectPayload(form);

    if (!submitUrl) {
      box.textContent = 'Շնորհակալություն։';
      box.hidden = false;
      form.reset();
      clearExtraGuestRows(form);
      return;
    }

    try {
      const res: Response = await fetch(submitUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data: { ok?: boolean } = (await res.json()) as { ok?: boolean };
      if (!res.ok || data.ok !== true) {
        throw new Error(`HTTP ${res.status}`);
      }
      box.textContent = 'Շնորհակալություն։';
      box.hidden = false;
      form.reset();
      clearExtraGuestRows(form);
    } catch {
      box.textContent = 'Չհաջողվեց ուղարկել։ Խնդրում ենք փորձել կրկին։';
      box.hidden = false;
    }
  });
}
