import { describe, it, expect } from "vitest";
import { CURRENCY, LISTING_CATEGORIES, AMENITIES, CAMEROON_REGIONS } from "@/lib/utils/constants";

describe("constants", () => {
  describe("CURRENCY", () => {
    it("uses XAF currency code", () => {
      expect(CURRENCY.code).toBe("XAF");
    });

    it("is a zero-decimal currency", () => {
      expect(CURRENCY.isZeroDecimal).toBe(true);
    });

    it("uses FCFA symbol", () => {
      expect(CURRENCY.symbol).toBe("FCFA");
    });
  });

  describe("LISTING_CATEGORIES", () => {
    it("has 6 categories", () => {
      expect(LISTING_CATEGORIES).toHaveLength(6);
    });

    it("all categories have value, label_en, label_fr, and icon", () => {
      LISTING_CATEGORIES.forEach((cat) => {
        expect(cat.value).toBeTruthy();
        expect(cat.label_en).toBeTruthy();
        expect(cat.label_fr).toBeTruthy();
        expect(cat.icon).toBeTruthy();
      });
    });

    it("includes apartment category", () => {
      expect(LISTING_CATEGORIES.some((c) => c.value === "apartment")).toBe(true);
    });
  });

  describe("AMENITIES", () => {
    it("has at least 10 amenities", () => {
      expect(AMENITIES.length).toBeGreaterThanOrEqual(10);
    });

    it("all amenities have key, label_en, label_fr, and icon", () => {
      AMENITIES.forEach((amenity) => {
        expect(amenity.key).toBeTruthy();
        expect(amenity.label_en).toBeTruthy();
        expect(amenity.label_fr).toBeTruthy();
        expect(amenity.icon).toBeTruthy();
      });
    });

    it("includes Cameroon-specific amenities", () => {
      const keys = AMENITIES.map((a) => a.key);
      expect(keys).toContain("generator");
      expect(keys).toContain("water_tank");
      expect(keys).toContain("security_guard");
      expect(keys).toContain("gated");
    });
  });

  describe("CAMEROON_REGIONS", () => {
    it("has all 10 regions", () => {
      expect(CAMEROON_REGIONS).toHaveLength(10);
    });

    it("all regions have code, name_fr, and name_en", () => {
      CAMEROON_REGIONS.forEach((region) => {
        expect(region.code).toHaveLength(2);
        expect(region.name_fr).toBeTruthy();
        expect(region.name_en).toBeTruthy();
      });
    });

    it("includes Littoral region (LT)", () => {
      expect(CAMEROON_REGIONS.some((r) => r.code === "LT")).toBe(true);
    });
  });
});
