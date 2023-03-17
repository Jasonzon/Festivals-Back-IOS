create database festivals;

create table festival(
    festival_id serial primary key,
    festival_name varchar(255) not null,
    festival_year varchar(255) not null,
    festival_open boolean not null
);

create table jour(
    jour_id serial primary key,
    jour_name varchar(255) not null,
    jour_debut time not null,
    jour_fin time not null,
    jour_date date not null,
    jour_festival int not null,
    foreign key (jour_festival) references festival(festival_id) on delete cascade
);

create type user_role as enum('Admin','Basic');

create table benevole(
    benevole_id serial primary key,
    benevole_prenom varchar(255) not null,
    benevole_nom varchar(255) not null,
    benevole_mail varchar(255) unique not null,
    polyuser_password varchar(255) not null,
    polyuser_role user_role default 'Basic'
);

create type type_jeu as enum ('Enfant','Famille','Ambiance','Initie','Expert');

create table jeu(
    jeu_id serial primary key,
    jeu_name varchar(255) not null,
    jeu_type type_jeu not null
);

create table zone(
    zone_id serial primary key,
    zone_name varchar(255) not null,
    zone_benevoles int not null,
    zone_festival int not null,
    foreign key (zone_festival) references festival(festival_id) on delete cascade
);

create table affectation(
    affectation_id serial primary key,
    affectation_jeu int not null,
    foreign key (affectation_jeu) references jeu(jeu_id) on delete cascade,
    affectation_zone int not null,
    foreign key (affectation_zone) references zone(zone_id) on delete cascade
);

create table creneau(
    creneau_id serial primary key,
    creneau_debut time not null,
    creneau_fin time not null,
    creneau_jour int not null,
    foreign key (creneau_jour) references jour(jour_id) on delete cascade
);

create table travail(
    travail_id serial primary key,
    travail_benevole int not null,
    foreign key (travail_benevole) references benevole(benevole_id) on delete cascade,
    travail_zone int not null,
    foreign key (travail_zone) references zone(zone_id) on delete cascade,
    travail_creneau int not null,
    foreign key (travail_creneau) references creneau(creneau_id) on delete cascade
);
