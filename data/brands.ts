import type { Brand } from "@/types";

// TODO: replace with confirmed manufacturer profiles. Names below are catalogue labels taken from product titles.

function brand(id: string, name: string): Brand {
  return {
    id,
    slug: id,
    name,
    description:
      id === "tbc"
        ? "The manufacturer is not confirmed for this listing. Microvision will name the maker on the quotation."
        : `${name} is the catalogue label taken from the product title. Country of origin, authorisation and a company profile are TBC.`,
  };
}

export const brands: Brand[] = [
  brand("ams", "AMS"),
  brand("arkray", "Arkray"),
  brand("aution", "Aution"),
  brand("bioland", "Bioland"),
  brand("chem", "Chem"),
  brand("coag", "COAG"),
  brand("dus", "DUS"),
  brand("eaglenos", "Eaglenos"),
  brand("eagnos", "Eagnos"),
  brand("edan", "Edan"),
  brand("fastep", "Fastep"),
  brand("fluorecare", "Fluorecare"),
  brand("icon", "Icon"),
  brand("iflash", "Iflash"),
  brand("imteg", "IMTEG"),
  brand("iteg", "ITEG"),
  brand("lia", "Lia"),
  brand("loreena", "Loreena"),
  brand("mx", "MX"),
  brand("mythic", "Mythic"),
  brand("piccolo", "Piccolo"),
  brand("qlabs", "Qlabs"),
  brand("spotchem", "Spotchem"),
  brand("theia", "Theia"),
  brand("tbc", "Manufacturer TBC"),
];
