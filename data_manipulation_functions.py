import pandas as pd
import numpy as np
import os
import matplotlib.pyplot as plt
import seaborn as sns


class DataManipulator():
    def __init__(self, path, name):
        self.path = path
        self.name = name

        self.df = pd.read_csv(path, sep=';')
        print('Starting to parse the date')
        self.parse_date('date')

        self.product_count_per_year = self.df['year'].value_counts().sort_index()
        self.average_price_per_year = self.df.groupby('year')['chf'].mean()
        



    def parse_date(self, date_col):

        tmp = self.df.copy(deep=True)

        if tmp[date_col].isnull().any():
                raise ValueError(f"Column '{date_col}' contains missing values")


        tmp[['day', 'month', 'year']] = tmp[date_col].str.split('.', expand=True)
        tmp['day'] = tmp['day'].astype(int)
        tmp['month'] = tmp['month'].astype(int)
        tmp['year'] = tmp['year'].astype(int)

        self.df = tmp.copy(deep=True)

    def first_graph(self):
        plt.figure(figsize=(10, 6))
        sns.barplot(x=self.product_count_per_year.index, y=self.product_count_per_year.values)
        plt.title('Count of Products ' + self.name)
        plt.xlabel('Year')
        plt.ylabel('Count')
        plt.xticks(rotation=45)
        plt.show()


        plt.figure(figsize=(10, 6))
        sns.barplot(x=self.average_price_per_year.index, y=self.average_price_per_year.values)
        plt.title('Average Price (CHF) ' + self.name)
        plt.xlabel('Year')
        plt.ylabel('Average CHF')
        plt.xticks(rotation=45)
        plt.show()
            
