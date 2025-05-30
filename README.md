# Project of Data Visualization (COM-480)

| Student's name | SCIPER |
| -------------- | ------ |
| Tatiana Tuor | 261 424 |
| Robin Patriarca | 263 711 |
| Mathis Magnin | 327 838 |

[Milestone 1](#milestone-1-21st-march-5pm) • [Milestone 2](#milestone-2-18th-april-5pm) • [Milestone 3](#milestone-3-30th-may-5pm)

Our website is [here](https://com-480-data-visualization.github.io/com-480-import-export/)

## Milestone 1 (21st March, 5pm)

## Instructions

**10% of the final grade**

This is a preliminary milestone to let you set up goals for your final project and assess the feasibility of your ideas.
Please, fill the following sections about your project.

*(max. 2000 characters per section)*

### Dataset

> Find a dataset (or multiple) that you will explore. Assess the quality of the data it contains and how much preprocessing / data-cleaning it will require before tackling visualization. We recommend using a standard dataset as this course is not about scraping nor data processing.
>
> Hint: some good pointers for finding quality publicly available datasets ([Google dataset search](https://datasetsearch.research.google.com/), [Kaggle](https://www.kaggle.com/datasets), [OpenSwissData](https://opendata.swiss/en/), [SNAP](https://snap.stanford.edu/data/) and [FiveThirtyEight](https://data.fivethirtyeight.com/)), you could use also the DataSets proposed by the ENAC (see the Announcements section on Zulip).


We have decided to use the dataset provided by Swiss OpenData which contains Swiss import and export data per tariff number and country, updated monthly from 1988 to 2023. This dataset provides detailed trade flows, including product categories and destination/origin countries. The data is accessible at [Swiss Import Export Dataset (1988-present)](https://opendata.swiss/en/dataset/schweizerische-exporte-und-importe-nach-tarifnummer-und-land-monatliche-daten-ab-1988).  


The main files (CSV format) contain six key pieces of information: import or export status, date, tariff ID, country ID, price, and weight. Despite the fact that occasionally, the weight is missing for some products, the dataset is very clean and organised. In addition to the main files, there are two auxiliary files: one containing a table with tariff IDs and their description of the products, and another containing a table with country IDs and their corresponding names. All this information is available in three languages (German, French, and English).  


### Problematic

> Frame the general topic of your visualization and the main axis that you want to develop.
> - What am I trying to show with my visualization?
> - Think of an overview for the project, your motivation, and the target audience.

This project aims to create an interactive website that visually represents Swiss trade patterns, making complex trade data easy to understand. It will include an interactive map and various statistical representations such as graphs, tables, and key metrics.  

We anticipate two main types of users:  
1. **Experts** (economic, geographic, or historical) interested in a general overview of Swiss imports and exports.  
2. **Consumers** who want to explore the provenance of specific products and their evolution over time.  

### Exploratory Data Analysis

> Pre-processing of the data set you chose
> - Show some basic statistics and get insights about the data

For basic preprocessing, we loaded the dataset and parsed the date column into month and year. We handled missing dates by raising an error but found none. We noticed that the column containing the weight in kg of what is imported or exported seems to be missing often.

We created some plots of product count and total value of merchandise imported/export per year, displayed in `first_look.ipynb`, to gain initial insights into the data. As an example, we took the import of living reproductive horses in order to see how its trend evolved over time. This confirmed that a grouping by types of products could reveal interesting trends. 

### Related work


> - What others have already done with the data?
> - Why is your approach original?
> - What source of inspiration do you take? Visualizations that you found on other websites or magazines (might be unrelated to your data).
> - In case you are using a dataset that you have already explored in another context (ML or ADA course, semester project...), you are required to share the report of that work to outline the differences with the submission for this class.

We were not able to find other projects that present this data in a very visually intuitive manner. Our approach is unique because we will focus on interactive, detailed and user-friendly visualizations rather than statistical reports, such as the [Swiss Federal Customs Administration Reports](https://www.bazg.admin.ch/bazg/en/home/topics/swiss-foreign-trade-statistics/daten/gesamtexporte-und-importe.html).  

Currently, our inspirations include previous projects from this course, course slides, and pre-visualization examples from the [D3.js](https://d3js.org/) library.  

## Milestone 2 (18th April, 5pm)

**10% of the final grade**

View our [Milestone 2 PDF Report](milestone2/com_480_ms2.pdf) and the early version of our [website](https://com-480-data-visualization.github.io/com-480-import-export/) featuring the initial structure and layout.

## Milestone 3 (30th May, 5pm)

**80% of the final grade**

Our screencast can be found [here](milestone3/screencast.mov)
Our process book can be found [here](milestone3/com_480_ms3.pdf)

### Technical Setup and Intended Usage

The Swiss Trade Visualizer is divided into two main sections: an **interactive map** and **statistical dashboards**. Each part uses a distinct technical architecture optimized for performance and usability.

### Interactive Map

The interactive map enables users to explore Switzerland’s trade relationships by selecting specific countries, years, and product categories.

However, since the underlying dataset contains nearly **50 million entries**, in-browser aggregation was **not feasible**. 

- **Solution**:
  - The dataset is stored in an **Amazon RDS PostgreSQL** database.
  - We created **Materialized Views** that precompute commonly used aggregations (by year, country, product).
  - Two **API endpoints**, powered by **AWS Lambda**, expose the data—one for imports and one for exports.
  - These APIs allow queries by:
    - Time range
    - Country
    - Product type (specific tariff or grouped category)

This solution drastically reduced query times and made the map highly responsive and interactive.

### Statistical Dashboards

The statistics page provides clean, informative visualizations through bar charts, pie charts, and more. Unlike the map, this section prioritizes fast access and readability over full interactivity.

- All visualizations are based on **preprocessed `.json` files**.
- These files are stored **locally** in the repository (website/datastats).
- This allows for:
  - **Instant loading**
  - **No server interaction**
  - **Better performance across devices**

This trade-off complements the interactive map: while the map supports deep exploration, the dashboard offers quick, curated insights.

## Late policy

- < 24h: 80% of the grade for the milestone
- < 48h: 70% of the grade for the milestone

