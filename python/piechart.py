import pandas as pd
import json
from collections import defaultdict

# Paths
path_I = "../dataset/import_full.csv"
path_E = "../dataset/export_full.csv"
path_country = "../dataset/OGD_LAND.csv"
product_path = "../website/data/product.json"
output_path = "../website/datastats/piechart.json"

# Load data
df_I = pd.read_csv(path_I, sep=';')
df_E = pd.read_csv(path_E, sep=';')
df_country = pd.read_csv(path_country, sep=';', encoding='latin1')
with open(product_path, 'r', encoding='utf-8') as f:
    product_data = json.load(f)

# Build a mapping from detailed tn_num to top-level category ID and text
def flatten_products(products):
    mapping = {}
    for cat in products:
        cat_id = cat["id"]
        cat_text = cat["text"]
        for tn2 in cat.get("tn2", []):
            for tn4 in tn2.get("tn4", []):
                for tn in tn4.get("tn", []):
                    mapping[tn["id"]] = {
                        "top_id": cat_id,
                        "top_text": cat_text
                    }
    return mapping

product_mapping = flatten_products(product_data)

# Add top-level category to import/export data
def assign_top_category(df):
    df["top_id"] = df["tn_num"].map(lambda x: product_mapping.get(str(x), {}).get("top_id"))
    df["top_text"] = df["tn_num"].map(lambda x: product_mapping.get(str(x), {}).get("top_text"))
    return df

df_I = assign_top_category(df_I)
df_E = assign_top_category(df_E)

# Filter out entries not in product_mapping
df_I = df_I[df_I["top_id"].notna()]
df_E = df_E[df_E["top_id"].notna()]

# Create mapping of country ID to English name
country_mapping = df_country.set_index("ctry_id")["ctry_e"].to_dict()

# Function to compute aggregates
def aggregate_by_country(df, direction):
    result = defaultdict(lambda: {"direction": direction, "countries": {}})
    grouped = df.groupby(["top_id", "top_text", "ctry_id"])["chf"].sum().reset_index()
    for _, row in grouped.iterrows():
        top_id, top_text, ctry_id, chf = row
        country = country_mapping.get(ctry_id, f"Unknown_{ctry_id}")
        result[top_id]["category"] = top_text
        result[top_id]["countries"][country] = result[top_id]["countries"].get(country, 0) + chf
    # Sort countries by value
    for top_id in result:
        sorted_countries = dict(sorted(result[top_id]["countries"].items(), key=lambda item: item[1], reverse=True))
        result[top_id]["countries"] = sorted_countries
    return result

import_data = aggregate_by_country(df_I, "import")
export_data = aggregate_by_country(df_E, "export")

# Combine both directions
final_output = {}
for data in [import_data, export_data]:
    for top_id, content in data.items():
        if top_id not in final_output:
            final_output[top_id] = {
                "category": content["category"],
                "import": {},
                "export": {}
            }
        final_output[top_id][content["direction"]] = content["countries"]

# Save output
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(final_output, f, indent=2, ensure_ascii=False)

print("Piechart data written to", output_path)
