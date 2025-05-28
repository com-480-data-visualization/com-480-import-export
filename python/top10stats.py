import pandas as pd
import json

# Paths
path_I = "../dataset/import_full.csv"
path_E = "../dataset/export_full.csv"
product_path = "../website/data/product.json"
output_path = "../website/datastats/top10stats.json"

# Load data
df_I = pd.read_csv(path_I, sep=';')
df_E = pd.read_csv(path_E, sep=';')

# Convert date columns to datetime
df_I['date'] = pd.to_datetime(df_I['date'], dayfirst=True)
df_E['date'] = pd.to_datetime(df_E['date'], dayfirst=True)

# Extract year
df_I['year'] = df_I['date'].dt.year
df_E['year'] = df_E['date'].dt.year

# Normalize tn_num to "####.####"
def normalize_tn_with_dot(x):
    try:
        s = ''.join(c for c in str(x) if c.isdigit())
        s = s.ljust(8, '0')  # pad to 8 digits
        s = s[:8]
        return f"{s[:4]}.{s[4:]}"
    except:
        return str(x)

df_I['tn_num'] = df_I['tn_num'].apply(normalize_tn_with_dot)
df_E['tn_num'] = df_E['tn_num'].apply(normalize_tn_with_dot)

# Load product hierarchy and flatten
def flatten_product_hierarchy(data):
    mapping = {}
    for chapter in data:
        for tn2 in chapter.get("tn2", []):
            for tn4 in tn2.get("tn4", []):
                for tn in tn4.get("tn", []):
                    key = tn["id"]
                    if len(key) == 8:
                        key = f"{key[:4]}.{key[4:]}"
                    mapping[key] = tn["text"]
    return mapping

with open(product_path, "r", encoding="utf-8") as f:
    product_hierarchy = json.load(f)

tn_mapping = flatten_product_hierarchy(product_hierarchy)

# Helper to apply mapping
def map_tn_name(series):
    return series.rename(index=lambda x: tn_mapping.get(x, f"Unknown ({x})"))

# Top 10 imported products
top_imported = df_I.groupby('tn_num')['chf'].sum().sort_values(ascending=False).head(10)
top_imported_named = map_tn_name(top_imported)

# Top 10 exported products
top_exported = df_E.groupby('tn_num')['chf'].sum().sort_values(ascending=False).head(10)
top_exported_named = map_tn_name(top_exported)

# Top 10 import years
top_import_years = df_I.groupby('year')['chf'].sum().sort_values(ascending=False).head(10)

# Top 10 export years
top_export_years = df_E.groupby('year')['chf'].sum().sort_values(ascending=False).head(10)

# Absolute difference between imports and exports by product
import_sum = df_I.groupby('tn_num')['chf'].sum()
export_sum = df_E.groupby('tn_num')['chf'].sum()

diff_df = pd.DataFrame({
    'import_chf': import_sum,
    'export_chf': export_sum
}).fillna(0)

diff_df['abs_diff'] = (diff_df['import_chf'] - diff_df['export_chf']).abs()
top_diff = diff_df.sort_values('abs_diff', ascending=False).head(10)
top_diff_named = top_diff.rename(index=lambda x: tn_mapping.get(x, f"Unknown ({x})"))

# Final result structure
result = {
    "top_imported_products": {
        "description": "Top 10 most imported products (by CHF).",
        "data": top_imported_named.to_dict()
    },
    "top_exported_products": {
        "description": "Top 10 most exported products (by CHF).",
        "data": top_exported_named.to_dict()
    },
    "highest_importation_years": {
        "description": "Top 10 years with highest total import value (CHF).",
        "data": top_import_years.to_dict()
    },
    "highest_exportation_years": {
        "description": "Top 10 years with highest total export value (CHF).",
        "data": top_export_years.to_dict()
    },
    "biggest_import_export_diff_products": {
        "description": "Top 10 products with the largest absolute difference between import and export CHF values.",
        "data": top_diff_named[['import_chf', 'export_chf', 'abs_diff']].to_dict(orient='index')
    }
}

# Export to JSON
with open(output_path, "w", encoding='utf-8') as f:
    json.dump(result, f, indent=4, ensure_ascii=False)

print(f"Top 10 trade statistics exported to {output_path}")
