import pandas as pd
import numpy as np
import os
import matplotlib.pyplot as plt
import seaborn as sns
from products_df import Products
from lands_df import Lands


class DataManipulator():
    def __init__(self, paths: list[str], name: str):
        self.paths = paths
        self.name = name

        self.product_data = Products('dataset/OGD_TARIFNUMMER.csv')
        self.lands_data = Lands('dataset/OGD_LAND.csv')

        # data
        dfs = [pd.read_csv(path, sep=';') for path in self.paths] 
        self.df = pd.concat(dfs, ignore_index=True)
    
        print('Starting to parse the date')
        self.parse_date('date')

        # stats
        self.product_count_per_year = self.df['year'].value_counts().sort_index()
        self.sum_price_per_year = self.df.groupby('year')['chf'].sum()


    def parse_date(self, date_col):
        
        if self.df[date_col].isnull().any():
            raise ValueError(f"Import DataFrame: Column '{date_col}' contains missing values")
        self.df[date_col] = pd.to_datetime(self.df[date_col], format='%d.%m.%Y', errors='raise')
        self.df['month'] = self.df[date_col].dt.month
        self.df['year'] = self.df[date_col].dt.year
       
       
    def graphs(self):
        fig, axs = plt.subplots(1, 2, figsize=(16, 8))

        sns.barplot(x=self.product_count_per_year.index, y=self.product_count_per_year.values, ax=axs[0])
        axs[0].set_title(f'[{self.name}] Count of Products')
        axs[0].set_xlabel('Year')
        axs[0].set_ylabel('Count')
        axs[0].tick_params(axis='x', rotation=45)

        sns.barplot(x=self.sum_price_per_year.index, y=self.sum_price_per_year.values, ax=axs[1])
        axs[1].set_title(f'[{self.name}] Total Value (CHF)')
        axs[1].set_xlabel('Year')
        axs[1].set_ylabel('CHF')
        axs[1].tick_params(axis='x', rotation=45)

        plt.tight_layout()
        plt.show()
        
    def display(self, n=5):
        print(self.df.head(n))
    
    def get_product_name(self, product):
        product_name = self.product_data.df.loc[self.product_data.df['tn_num'] == product]['tn_f'].values[0]
        print(f'Product: {product_name}')
        return product_name
    
    def get_product_graph(self, product):
        product_name = self.get_product_name(product)
        product_df = self.df[self.df['tn_num'] == product].copy(deep=True)
        
        fig, ax = plt.subplots()
        sns.barplot(x=product_df['year'], y=product_df['chf'], ax=ax, ci=None)
        ax.set_title(f'[{self.name}] {product_name} Value (CHF)')
        ax.set_xlabel('Year')
        ax.set_ylabel('CHF')
        ax.tick_params(axis='x', rotation=45)
        plt.tight_layout()
        plt.show()
        return product_df



