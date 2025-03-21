import pandas as pd

class Products():
    def __init__(self, path):
        self.df = pd.read_csv(path, sep=';', encoding='latin1')

 

if __name__ == "__main__":
    path = 'dataset/OGD_TARIFNUMMER.csv'
    products = Products(path)
    print(products.df.head())


