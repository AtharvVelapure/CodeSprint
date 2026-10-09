package com.Av.Online.Coding.Practice.Platform.Service.executor;

import java.util.List;

import com.Av.Online.Coding.Practice.Platform.dto.RunCodeResponse;
import com.Av.Online.Coding.Practice.Platform.entity.TestCase;

public interface CodeExecutor {

	 RunCodeResponse execute(
			 
	String code,List<TestCase> testCases);
}
