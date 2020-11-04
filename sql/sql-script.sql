create extension if not exists "uuid-ossp"

create table products (
	id uuid primary key default uuid_generate_v4(),
	title text not null,
  description text,
  price integer
)

create table stocks (
	product_id uuid unique,
	count integer,
	foreign key ("product_id") references "products" ("id")
)

insert into products (title, description, price) values
  ('ProductOne','Short Product Description1', 2.4),
  ('ProductNew', 'Short Product Description3', 10),
  ('ProductTop', 'Short Product Description2', 23),
  ('ProductTitle', 'Short Product Description7', 15),
  ('Product', 'Short Product Description2', 23),
  ('ProductTest', 'Short Product Description4', 15),
  ('Product2', 'Short Product Description', 23),
  ('ProductName', 'Short Product Description7', 15)

insert into stocks (product_id, count) values
  ('21ba2289-50bf-40a2-8028-372cc5d59384', 4),
  ('fc242f84-7e7c-4888-bb76-76a0310cf9e3', 6),
  ('8527b10c-6bc6-44c4-8487-05c5f0124836', 7),
  ('4cd8d0ea-e70b-42f4-a2d8-9422ea44aa33', 12),
  ('e2f43c3e-1810-4911-a025-15087c18a4d3', 7),
  ('7662f8a6-6886-409c-8def-d45195b9572e', 8),
  ('f7b4ad1e-7e25-4073-8bb8-371b17ca4200', 2),
  ('76b77678-444b-4459-8931-727ec21ba5a1', 3)

select * from products;
select * from stocks;

select products.*, stocks.count from products inner join stocks on products.id=stocks.product_id
