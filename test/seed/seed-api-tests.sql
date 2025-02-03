INSERT INTO public.dog (id, dog_breed_id, status_id, name, birth_date, tattoo, colour, sex, dog_reference, index_number, death_date, exported_date, stolen_date, untraceable_date, deleted_at, created_at, updated_at) values (100001, 1, 7, 'Zaya', '2019-05-12', null, 'Lilac and white', 'Male', '46754363-3b12-4cce-a366-0b969022096f', 'ED100001', null, null, null, null, null, NOW(), NOW());
INSERT INTO public.microchip (microchip_number, deleted_at, created_at, updated_at) values ('125478963245879', null, NOW(), NOW());
INSERT INTO public.dog_microchip (dog_id, microchip_id, deleted_at, created_at, updated_at) values (100001, 1, null, NOW(), NOW());
INSERT INTO public.insurance (policy_number, company_id, renewal_date, dog_id, created_at, updated_at, deleted_at) values (null, 1, '9999-02-01', 100001, NOW(), NOW(), null);
INSERT INTO public.registration (dog_id, status_id, police_force_id, time_limit, cdo_issued, cdo_expiry, court_id, legislation_officer, application_fee_paid, neutering_confirmation, microchip_verification, joined_exemption_scheme, certificate_issued, exemption_order_id, withdrawn, typed_by_dlo, microchip_deadline, non_compliance_letter_sent, neutering_deadline, deleted_at, created_at, updated_at, application_pack_sent, form_two_sent, insurance_details_recorded, microchip_number_recorded, application_fee_payment_recorded, verification_dates_recorded, application_pack_processed) values (100001, 1, 44, null, null, null, null, '', '2023-11-17', null, null, null, '2023-11-17', 2, null, null, '2024-03-31', null, '2024-06-30', null, NOW(), NOW(), null, null, '2025-02-01', '2025-02-01', '2025-02-01', null, null);
INSERT INTO public.person (first_name, last_name, person_reference, birth_date, organisation_id, deleted_at, created_at, updated_at) values ('Example', 'Owner', 'P-B0AC-1831', '1976-08-04', null, null, '2025-02-01 12:12:09.559514 +00:00', '2025-02-01 12:12:09.569000 +00:00');
INSERT INTO public.registered_person (person_id, dog_id, person_type_id, deleted_at, created_at, updated_at) values (1, 100001, 1, null, '2025-02-01 12:12:09.559514 +00:00', '2025-02-01 12:12:09.604000 +00:00');
INSERT INTO public.address (address_line_1, address_line_2, postcode, county, country_id, town, deleted_at, created_at, updated_at) values ('11 Maine Street', 'Bensham', 'RG2 6AG', null, 1, 'Reading', null, '2025-02-01 12:12:09.559514 +00:00', '2025-02-01 12:12:09.574000 +00:00');
INSERT INTO public.contact (contact, contact_type_id, deleted_at, created_at, updated_at) values ('example_owner@hotmail.com', 2, null, '2025-02-01 12:12:09.559514 +00:00', '2025-02-01 12:12:09.586000 +00:00');
INSERT INTO public.contact (contact, contact_type_id, deleted_at, created_at, updated_at) values ('020 4525 7854', 1, null, '2025-02-01 12:12:09.559514 +00:00', '2025-02-01 12:12:09.590000 +00:00');
INSERT INTO public.person_address (person_id, address_id, deleted_at, created_at, updated_at) values (1, 1, null, '2025-02-01 12:12:09.559514 +00:00', '2025-02-01 12:12:09.578000 +00:00');
INSERT INTO public.person_contact (person_id, contact_id, deleted_at, created_at, updated_at) values (1, 1, null, '2025-02-01 12:12:09.559514 +00:00', '2025-02-01 12:12:09.588000 +00:00');
INSERT INTO public.person_contact (person_id, contact_id, deleted_at, created_at, updated_at) values (1, 2, null, '2025-02-01 12:12:09.559514 +00:00', '2025-02-01 12:12:09.591000 +00:00');
INSERT INTO public.search_index (search, json, person_id, dog_id, created_at, updated_at, police_force_id) values ('''11'':7 ''125478963245879'':17 ''1831'':4 ''6ag'':13 ''b0ac'':3 ''bensham'':10 ''ed100001'':15 ''exampl'':5 ''main'':8 ''owner'':6 ''p'':2 ''p-b0ac'':1 ''read'':11 ''rg2'':12 ''rg26ag'':14 ''street'':9 ''zaya'':16', '{"address": {"town": "Reading", "postcode": "RG2 6AG", "address_line_1": "11 Maine Street", "address_line_2": "Bensham"}, "dogName": "Zaya", "dogIndex": "ED100001", "lastName": "Owner", "dogStatus": "Exempt", "firstName": "Example", "microchipNumber": "125478963245879", "personReference": "P-B0AC-1831"}', 1, 100001, NOW(), NOW(), 1);
INSERT INTO public.search_match_code (person_id, match_code, created_at, updated_at, deleted_at) values (1, '054678', '2025-02-01 12:12:09.559514 +00:00', '2025-02-01 12:12:09.612000 +00:00', null);
INSERT INTO public.search_match_code (person_id, match_code, created_at, updated_at, deleted_at) values (1, 'EXANPL', '2025-02-01 12:12:09.559514 +00:00', '2025-02-01 12:12:09.612000 +00:00', null);
INSERT INTO public.search_match_code (person_id, match_code, created_at, updated_at, deleted_at) values (1, '076900', '2025-02-01 12:12:09.559514 +00:00', '2025-02-01 12:12:09.613000 +00:00', null);
INSERT INTO public.search_match_code (person_id, match_code, created_at, updated_at, deleted_at) values (1, 'ONAR', '2025-02-01 12:12:09.559514 +00:00', '2025-02-01 12:12:09.614000 +00:00', null);
INSERT INTO public.search_match_code (person_id, match_code, created_at, updated_at, deleted_at) values (1, '936500', '2025-02-01 12:12:09.559514 +00:00', '2025-02-01 12:12:09.615000 +00:00', null);
INSERT INTO public.search_tgram (person_id, dog_id, match_text, created_at, updated_at, deleted_at) values (null, 100001, '125478963245879', '2025-02-01 12:12:09.559514 +00:00', '2025-02-01 12:12:09.609000 +00:00', null);
INSERT INTO public.search_tgram (person_id, dog_id, match_text, created_at, updated_at, deleted_at) values (1, null, 'rg26ag', '2025-02-01 12:12:09.559514 +00:00', '2025-02-01 12:12:09.610000 +00:00', null);
