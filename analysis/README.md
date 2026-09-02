# Jan–Aug Sales Analysis

Fair comparison of Jan–Aug 2025 vs Jan–Aug 2026 for Uniflox, Ruatine, Unicast 10 mg, Olaxy, Dinixir, and Hi Dee drops.

## Methodology
- Period: January–August in both years.
- Sales: `Net Amount (Invoiced)`.
- Zone sales share: zone net sales / total net sales for the product family in that year.
- Growth: `(2026 sales - 2025 sales) / 2025 sales`.
- Customer growth/decline rankings exclude customers with 2025 baseline sales <= 0.
- Sales Expire: rows where `Warehouse = Sales Return-Expired`; expire rate = absolute expired `Returned Amount (Invoiced)` / positive gross `Sold Amount (Invoiced)`.
- Unicast is limited to Unicast 10 Tablets; Hi Dee is limited to Hi Dee 2000 Drops. Other named families include all matching strengths/packs.

The detailed formatted Excel report is generated as `Jan-Aug-Analysis-GL.xlsx` in the ChatGPT analysis output. GitHub connector access in this session supports UTF-8 text files but not binary `.xlsx` uploads, so the repository contains text exports of the analysis rather than the binary workbooks.
