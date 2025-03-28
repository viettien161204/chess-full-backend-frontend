package com.btec.Chess;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
@ComponentScan(basePackages = {"com.btec.Chess"})
public class ChessApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(ChessApiApplication.class, args);
	}

}
