create database festivals;

create table benevole(
    benevole_id serial primary key,
    benevole_prenom varchar(255) not null,
    benevole_nom varchar(255) not null,
    benevole_mail varchar(255) unique not null
);

create type type_jeu as enum ('enfant','famille','ambiance','initie','expert');

create table jeu(
    jeu_id serial primary key,
    jeu_name varchar(255) not null,
    jeu_type type_jeu not null
);

create table zone(
    zone_id serial primary key,
    zone_name varchar(255) not null
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
    creneau_debut timestamp not null,
    creneau_fin timestamp not null
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

create type user_role as enum('admin','basic');

create table polyuser(
    polyuser_id serial primary key,
    polyuser_mail varchar(255) unique not null,
    polyuser_nom varchar(255) not null,
    polyuser_prenom varchar(255) not null,
    polyuser_password varchar(255) not null,
    polyuser_role user_role default 'basic'
);