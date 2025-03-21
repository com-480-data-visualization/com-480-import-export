import pandas as pd

class Lands():
    def __init__(self, path):
        self.df = pd.read_csv(path, sep=';', encoding='latin1')

 

if __name__ == "__main__":
    path = 'dataset/OGD_LAND.csv'
    products = Lands(path)
    print(products.df.head())
