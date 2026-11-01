import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { FlavorPicker, availableFlavorName } from "./flavor-picker";

const FLAVORS = [
  { id: 1, name: "Matcha Oreo", isAvailable: true, imageUrl: "/api/photos/products/matcha-w960.webp" },
  { id: 2, name: "Vanilla", isAvailable: true, imageUrl: null },
  { id: 3, name: "Red Velvet", isAvailable: false, imageUrl: null },
];

describe("FlavorPicker", () => {
  test("shows the photo of the chosen flavour", () => {
    const html = renderToStaticMarkup(
      <FlavorPicker name="rasa" flavors={FLAVORS} value="Matcha Oreo" onChange={() => {}} />,
    );
    expect(html).toContain('alt="Rasa Matcha Oreo"');
    expect(html).toContain("Pilih rasa");
  });

  test("no preview when the chosen flavour has no photo, or nothing is chosen", () => {
    const vanilla = renderToStaticMarkup(<FlavorPicker name="rasa" flavors={FLAVORS} value="Vanilla" onChange={() => {}} />);
    expect(vanilla).not.toContain('alt="Rasa');
    const none = renderToStaticMarkup(<FlavorPicker name="rasa" flavors={FLAVORS} value={null} onChange={() => {}} />);
    expect(none).not.toContain('alt="Rasa');
  });

  test("a sold-out flavour is disabled and cannot be ordered", () => {
    const html = renderToStaticMarkup(<FlavorPicker name="rasa" flavors={FLAVORS} value={null} onChange={() => {}} />);
    expect(html).toMatch(/<input[^>]*disabled=""[^>]*value="Red Velvet"/);
    expect(availableFlavorName(FLAVORS, "Red Velvet")).toBeNull();
    expect(availableFlavorName(FLAVORS, "Vanilla")).toBe("Vanilla");
  });
});
