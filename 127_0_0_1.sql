-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 17/05/2026 às 02:17
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `db_mostra`
--
DROP DATABASE IF EXISTS `db_mostra`;
CREATE DATABASE IF NOT EXISTS `db_mostra` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `db_mostra`;

-- --------------------------------------------------------

--
-- Estrutura para tabela `tb_login`
--

DROP TABLE IF EXISTS `tb_login`;
CREATE TABLE IF NOT EXISTS `tb_login` (
  `usuario` varchar(100) NOT NULL,
  `senha` varchar(100) NOT NULL,
  PRIMARY KEY (`usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `tb_login`
--

INSERT INTO `tb_login` (`usuario`, `senha`) VALUES
('', ''),
('bruno', '1234'),
('lari', '12345'),
('pato', '12345');

-- --------------------------------------------------------

--
-- Estrutura para tabela `tb_metas`
--

DROP TABLE IF EXISTS `tb_metas`;
CREATE TABLE IF NOT EXISTS `tb_metas` (
  `id_meta` int(11) NOT NULL AUTO_INCREMENT,
  `nome_meta` varchar(150) NOT NULL,
  `periodo_d_tempo` tinyint(4) NOT NULL,
  `medida` tinyint(4) NOT NULL,
  `quantidade` int(11) NOT NULL,
  `genero` tinyint(4) NOT NULL,
  `nome_obras` varchar(150) NOT NULL,
  `nome_autor` varchar(150) NOT NULL,
  `dia_comecou` date NOT NULL,
  `dia_terminou` date NOT NULL,
  `status` tinyint(4) NOT NULL,
  `usu` varchar(100) NOT NULL,
  PRIMARY KEY (`id_meta`),
  KEY `fk_usu_metas` (`usu`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `tb_resumos`
--

DROP TABLE IF EXISTS `tb_resumos`;
CREATE TABLE IF NOT EXISTS `tb_resumos` (
  `id_resumo` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(150) NOT NULL,
  `resumo` text NOT NULL,
  `usu` varchar(100) NOT NULL,
  PRIMARY KEY (`id_resumo`),
  KEY `fk_usu_resumos` (`usu`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `tb_metas`
--
ALTER TABLE `tb_metas`
  ADD CONSTRAINT `fk_usu_metas` FOREIGN KEY (`usu`) REFERENCES `tb_login` (`usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `tb_resumos`
--
ALTER TABLE `tb_resumos`
  ADD CONSTRAINT `fk_usu_resumos` FOREIGN KEY (`usu`) REFERENCES `tb_login` (`usuario`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
