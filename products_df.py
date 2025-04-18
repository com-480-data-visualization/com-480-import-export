import pandas as pd

class Products():
    def __init__(self, path, path_category):
        self.path = path
        self.path_category = path_category
        self.df = pd.read_csv(path, sep=';', encoding='latin1')
        self.cat = self.parse_category()
        
    def parse_category(self):
        df = pd.read_csv(self.path_category, sep=',', dtype=str, encoding='utf-8', index_col=False)
        columns_to_keep = ['Typ', 'Numm', 'Text D', 'Text F', 'Text I', 'Text E']
        df = df[columns_to_keep]
        cat_df = df[df['Typ'].isin(['TAB', 'TN2', 'TN4'])]

        cat_df['TAB'] = cat_df.apply(lambda row: row['Numm'] if row['Typ'] == 'TAB' else None, axis=1)
        cat_df['TAB'] = cat_df['TAB'].ffill()

        cat_df['TN2'] = cat_df.apply(lambda row: row['Numm'] if row['Typ'] == 'TN2' else None, axis=1)
        cat_df['TN2'] = cat_df['TN2'].ffill()
        cat_df.loc[df['Typ'] == 'TAB', 'TN2'] = None # set TN2 value to None for rows of Typ=TAB

        cat_df['TN4'] = cat_df.apply(lambda row: row['Numm'] if row['Typ'] == 'TN4' else None, axis=1)
        cat_df['TN4'] = cat_df['TN4'].ffill()
        cat_df.loc[df['Typ'] == 'TAB', 'TN4'] = None # set TN4 value to None for rows of Typ=TAB
        cat_df.loc[df['Typ'] == 'TN2', 'TN4'] = None # set TN4 value to None for rows of Typ=TN2

        #cat1_df = df[df['Typ'].isin(['TAB'])]
        
        cat2_df = cat_df[cat_df['Typ'].isin(['TAB', 'TN2', 'TN4'])].copy()        
        
        return cat2_df

        

if __name__ == "__main__":
    path = 'dataset/OGD_TARIFNUMMER.csv'
    path_category = 'dataset/Tarifstruktur.csv'
    products = Products(path=path, path_category=path_category)
    
    print(products.df.head())
    print('Category count:', len(products.cat)) 


